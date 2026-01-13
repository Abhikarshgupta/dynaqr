# Debugging Git/SSH Authentication Issues

This guide helps you troubleshoot Git authentication problems, especially SSH key mismatches and permission errors.

---

## Quick Diagnostic Commands

### 1. Check Which SSH Key GitHub Sees

```bash
ssh -T git@github.com
```

**Expected output:**
- ✅ `Hi <username>! You've successfully authenticated...` = Working
- ❌ `Permission denied` = Wrong key or key not added to GitHub
- ❌ `Repository not found` = Wrong repository URL or no access

**What to look for:**
- The username in the message should match the repository owner
- If it shows a different username, that's your problem!

---

### 2. List All Your SSH Keys and Fingerprints

```bash
# Show all SSH public keys with fingerprints
for key in ~/.ssh/id_*.pub; do 
  [ -f "$key" ] && echo "=== $key ===" && ssh-keygen -lf "$key"
done
```

**What this tells you:**
- All SSH keys on your system
- Fingerprint of each key (matches what GitHub shows)
- Which key file corresponds to which fingerprint

**Example output:**
```
=== /Users/you/.ssh/id_ed25519_personal.pub ===
256 SHA256:yAke/p4XHaJtsEsNr8Y+14MLORHRTWtbfL9fwsWI7dM abg71297@gmail.com (ED25519)

=== /Users/you/.ssh/id_rsa.pub ===
4096 SHA256:Bnomb81sW6AbmskGBmbnBsl5Ote6raWPDHgxNiInQYU user@host (RSA)
```

---

### 3. Check Which Key SSH is Actually Using

```bash
# Verbose SSH connection test
ssh -vT git@github.com 2>&1 | grep -E "(identity|Offering|Authentications)"
```

**What to look for:**
- `Offering public key: /Users/you/.ssh/id_rsa` = Shows which key is being tried
- If it's trying the wrong key, that's your issue!

---

### 4. Check Your SSH Config

```bash
cat ~/.ssh/config
```

**What to check:**
- Is there a `Host github.com` entry?
- Does it specify `IdentityFile`?
- Is it pointing to the correct key?

**Example correct config:**
```
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_personal
  IdentitiesOnly yes
```

---

### 5. Check Git Remote URL

```bash
git remote -v
```

**What to check:**
- Is it using SSH (`git@github.com:...`) or HTTPS (`https://github.com/...`)?
- Does the username/org match your GitHub account?
- Case sensitivity matters! `Abhikarshgupta` ≠ `abhikarsh-gupta`

**Example:**
```
origin  git@github.com:Abhikarshgupta/dynaqr.git (fetch)
origin  git@github.com:Abhikarshgupta/dynaqr.git (push)
```

---

### 6. Check SSH Agent Status

```bash
ssh-add -l
```

**What it means:**
- Lists keys currently loaded in SSH agent
- `The agent has no identities` = No keys loaded (SSH will try default keys)
- Empty output = Agent might not be running

**To add a key to agent:**
```bash
ssh-add ~/.ssh/id_ed25519_personal
```

---

## Common Issues and Solutions

### Issue 1: "Permission denied" but key is added to GitHub

**Symptoms:**
- `ssh -T git@github.com` shows wrong username
- Push fails with permission denied

**Debug steps:**
1. Check which key SSH is using: `ssh -vT git@github.com`
2. Compare fingerprint with GitHub: Check GitHub Settings → SSH Keys
3. If mismatch: Configure SSH to use correct key

**Solution:**
```bash
# Add to ~/.ssh/config
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_personal  # Use YOUR correct key
  IdentitiesOnly yes
```

---

### Issue 2: "Repository not found" but repository exists

**Symptoms:**
- Repository exists on GitHub
- `git ls-remote` works
- Push fails with "Repository not found"

**Debug steps:**
1. Check authenticated user: `ssh -T git@github.com`
2. Check remote URL: `git remote -v`
3. Verify username matches: Repository owner vs authenticated user

**Solution:**
- If username mismatch: Add SSH key to correct GitHub account
- If org mismatch: Ensure you're member of the organization
- If case mismatch: Update remote URL to match exactly

---

### Issue 3: Multiple GitHub Accounts

**Symptoms:**
- Have work and personal accounts
- Different keys for each
- Wrong account being used

**Solution - Use SSH aliases:**

```bash
# ~/.ssh/config
# Work account
Host github.com-work
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_rsa
  IdentitiesOnly yes

# Personal account  
Host github.com-personal
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_personal
  IdentitiesOnly yes

# Default (personal)
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_personal
  IdentitiesOnly yes
```

**Then update remote:**
```bash
# For work repos
git remote set-url origin git@github.com-work:company/repo.git

# For personal repos
git remote set-url origin git@github.com-personal:username/repo.git
```

---

### Issue 4: SSH Agent Not Loading Keys

**Symptoms:**
- `ssh-add -l` shows "no identities"
- SSH tries wrong default key

**Solution:**
```bash
# Add key to agent
ssh-add ~/.ssh/id_ed25519_personal

# Or add to SSH config (better - persistent)
# Add IdentityFile to ~/.ssh/config
```

---

## Step-by-Step Debugging Workflow

When you get a Git authentication error, follow this checklist:

### Step 1: Test SSH Connection
```bash
ssh -T git@github.com
```
- ✅ Shows correct username? → Go to Step 2
- ❌ Shows wrong username? → Fix SSH config (Issue 1)
- ❌ Permission denied? → Check key is added to GitHub

### Step 2: Check Remote URL
```bash
git remote -v
```
- ✅ URL matches repository owner? → Go to Step 3
- ❌ Wrong username/org? → Update remote URL

### Step 3: Verify Key Fingerprint
```bash
# Get fingerprint of key being used
ssh -vT git@github.com 2>&1 | grep "Offering public key"
cat ~/.ssh/config | grep IdentityFile

# Compare with GitHub
# Go to: https://github.com/settings/keys
```
- ✅ Fingerprints match? → Go to Step 4
- ❌ Different fingerprint? → Update SSH config

### Step 4: Test Repository Access
```bash
git ls-remote origin
```
- ✅ Works? → Try push again
- ❌ Repository not found? → Check permissions/access

---

## Quick Reference: Key Commands

```bash
# Test SSH connection
ssh -T git@github.com

# List SSH keys with fingerprints
for key in ~/.ssh/id_*.pub; do [ -f "$key" ] && echo "=== $key ===" && ssh-keygen -lf "$key"; done

# Check which key SSH uses
ssh -vT git@github.com 2>&1 | grep -E "(identity|Offering)"

# Check SSH config
cat ~/.ssh/config

# Check Git remote
git remote -v

# Check SSH agent
ssh-add -l

# Add key to agent
ssh-add ~/.ssh/id_ed25519_personal

# Test repository access
git ls-remote origin
```

---

## Understanding the Error Messages

### "Permission denied"
- **Meaning:** SSH key not authorized or wrong key being used
- **Fix:** Check key fingerprint matches GitHub, update SSH config

### "Repository not found"
- **Meaning:** Repository doesn't exist OR you don't have access
- **Fix:** Check remote URL, verify account has access

### "Could not read from remote repository"
- **Meaning:** Network/auth issue
- **Fix:** Check SSH connection, verify key is added

### "Bypassed rule violations"
- **Meaning:** Push worked but branch protection rules were bypassed
- **Fix:** This is OK if you're admin, otherwise create PR

---

## Pro Tips

1. **Always check the username first:**
   ```bash
   ssh -T git@github.com
   ```
   The username shown should match the repository owner.

2. **Use SSH config for multiple accounts:**
   Don't rely on default keys - always specify `IdentityFile` in config.

3. **Verify fingerprints match:**
   GitHub shows key fingerprints in Settings → SSH Keys. Match them with local keys.

4. **Test before pushing:**
   ```bash
   git ls-remote origin  # Tests read access
   ```

5. **Keep SSH config organized:**
   Use comments and consistent naming for multiple accounts.

---

## Example: Debugging Your Specific Issue

**Your error:** `Permission to Abhikarshgupta/dynaqr.git denied to abhika`

**Debugging steps:**

1. **Test SSH:**
   ```bash
   ssh -T git@github.com
   # Output: Hi abhikarsh-gupta! (wrong username!)
   ```

2. **Check keys:**
   ```bash
   for key in ~/.ssh/id_*.pub; do [ -f "$key" ] && ssh-keygen -lf "$key"; done
   # Found: id_ed25519_personal matches GitHub
   ```

3. **Check what SSH uses:**
   ```bash
   ssh -vT git@github.com | grep Offering
   # Output: Offering id_rsa (wrong key!)
   ```

4. **Fix SSH config:**
   ```bash
   # Add to ~/.ssh/config
   Host github.com
     IdentityFile ~/.ssh/id_ed25519_personal
   ```

5. **Verify:**
   ```bash
   ssh -T git@github.com
   # Output: Hi Abhikarshgupta! (correct!)
   ```

---

**Last Updated:** January 2025
