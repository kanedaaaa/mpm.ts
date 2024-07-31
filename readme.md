# Mini Package Manager / MPM

Naive implementation attempt of package manager for Node.JS.

**Available Commands**:

- init
- install
- uninstall

# Current Situation

- First layer of sub-dependencies are installed but there is no recursive method to install all nested
  dependencies.
- There is no .lock strategy, needs impl.
- Missing list command
