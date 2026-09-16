#!/usr/bin/env python3
"""PreToolUse hook (Bash): refuse anything that would publish the live landing pages or
the studio, or push the production branch, while batch/four-pages is being built.

Publish paths for this repo, verified 2026-09-16:
  - landing pages: Cloudflare Pages by DIRECT UPLOAD (`wrangler pages deploy`); the project
    is not git-connected, so a push alone does not publish them...
  - ...but the studio on Railway `git pull --ff-only`s main and its Publish button builds
    from it, so a push to main is one click from live. Blocked too.
  - studio: `railway up` / `railway redeploy`.

Only enforced inside this repository (CLAUDE_PROJECT_DIR), so the same entry in the user
settings file is inert elsewhere. Fails OPEN on unreadable input, so an unrelated tool bug
cannot brick every shell command; it prints why to stderr.
"""
import json, os, re, sys

REPO = 'tree-template-factory'
PROTECTED_BRANCHES = {'main', 'master', 'HEAD'}


def blocked_reason(cmd: str):
    if re.search(r'\bwrangler\s+(pages\s+)?(deploy|publish)\b', cmd):
        return 'wrangler pages deploy publishes the live landing pages. The batch is held for one approval; publish only after the owner approves and this hook is removed.'
    if re.search(r'\brailway\s+(up|redeploy|deploy)\b', cmd):
        return 'railway up deploys the studio. Held until the owner approves the batch.'
    if re.search(r'\bgh\s+pr\s+merge\b', cmd):
        return 'Merging into main is a step to publishing. Held until the owner approves the batch.'
    for m in re.finditer(r'\bgit\s+push\b(.*?)(?:&&|\|\||;|$)', cmd):
        args = m.group(1)
        if re.search(r'--force|--force-with-lease|(?<![\w-])-f\b|--delete|--all|--mirror|--tags', args):
            return 'A forced, deleting or bulk git push. Held.'
        toks = [t for t in re.split(r'\s+', args.strip()) if t and not t.startswith('-')]
        refs = [t for t in toks[1:]] if toks else []          # first token is the remote
        if not toks:
            return 'A bare `git push` pushes the current branch, which may be main. Name the branch: `git push -u origin batch/four-pages`.'
        if not refs:
            return f'`git push {toks[0]}` pushes the current branch, which may be main. Name the branch.'
        for r in refs:
            src, _, dst = r.partition(':')
            if src in PROTECTED_BRANCHES or dst in PROTECTED_BRANCHES:
                return f'`git push` targets {r}: the production branch. The studio pulls main, so this is one click from live. Held until the owner approves the batch.'
    return None


def main():
    try:
        data = json.load(sys.stdin)
    except Exception as e:  # fail open, loudly
        print(f'block-publish hook: could not read input ({e}); allowing', file=sys.stderr)
        return
    project = os.environ.get('CLAUDE_PROJECT_DIR') or data.get('cwd') or os.getcwd()
    if REPO not in project:
        return
    cmd = str((data.get('tool_input') or {}).get('command') or '')
    # Heredoc bodies are data, not commands: a commit message or a test fixture that quotes
    # the deploy command is not a deploy. Strip them before matching; the command that
    # runs the heredoc is still on its line and still matched.
    cmd = re.sub(r"<<-?\s*(['\"]?)(\w+)\1[^\n]*\n.*?\n\2[ \t]*$", '<<HEREDOC', cmd, flags=re.S | re.M)
    reason = blocked_reason(cmd)
    if not reason:
        return
    print(json.dumps({
        'hookSpecificOutput': {
            'hookEventName': 'PreToolUse',
            'permissionDecision': 'deny',
            'permissionDecisionReason': f'BLOCKED by .claude/hooks/block-publish.py — {reason}',
        },
    }))
    print(f'BLOCKED by block-publish hook: {reason}', file=sys.stderr)


if __name__ == '__main__':
    main()
