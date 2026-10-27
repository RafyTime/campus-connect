# Login shells reset PATH in /etc/profile; restore the deployed tools afterward.
export PATH="/app/node_modules/.bin:/mise/shims:$PATH"
