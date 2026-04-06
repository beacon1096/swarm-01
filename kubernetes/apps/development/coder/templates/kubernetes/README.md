# Kubernetes Template

Personal development environment template for Coder.

## Usage

### Option 1: Upload via UI (Recommended)

1. Download this directory:
   ```bash
   cd kubernetes/apps/development/coder/templates/kubernetes
   zip -r template.zip main.tf
   ```

2. Go to Coder UI → Templates → Create Template
3. Choose "Upload template files"
4. Upload `template.zip`
5. Name it `kubernetes-dev`

### Option 2: Use Coder CLI

```bash
# Install coder CLI
curl -L https://coder.com/install.sh | sh

# Login
coder login https://code.${SECRET_DOMAIN}

# Push template
cd kubernetes/apps/development/coder/templates/kubernetes
coder templates create kubernetes-dev
```

## Included Modules

| Module | Purpose |
|--------|---------|
| **code-server** | VS Code in browser (built-in) |
| **coder-login** | Auto-login to Coder CLI |
| **mux** | Parallel AI agent runner |
| **opencode** | AI coding assistant |

### OpenCode Authentication

After creating workspace, manually configure auth:

```bash
# Create auth config
mkdir -p ~/.local/share/opencode
cat > ~/.local/share/opencode/auth.json << 'EOF'
{
  "anthropic": {
    "type": "api",
    "key": "sk-ant-api03-xxx"
  },
  "google": {
    "type": "api",
    "key": "gem-xxx"
  }
}
EOF
```

## Configuration

- **Namespace**: `development` (default)
- **Image**: `codercom/enterprise-base:ubuntu`
- **CPU**: 1-4 cores (user choice)
- **Memory**: 2-8 GB (user choice)
- **Disk**: 5-50 GB (persistent)

## Customization

### Change base image

Edit `main.tf` and modify the `image` field:

```hcl
image = "your-custom-image:tag"
```

### Add tools to startup

Edit the `startup_script` in `main.tf`:

```hcl
startup_script = <<-EOT
  set -e
  # Install code-server
  curl -fsSL https://code-server.dev/install.sh | sh -s -- --method=standalone --prefix=/tmp/code-server
  
  # Install your tools
  apt-get update && apt-get install -y nodejs npm
  
  # Start code-server
  /tmp/code-server/bin/code-server --auth none --port 13337 >/tmp/code-server.log 2>&1 &
EOT
```

### Build custom image

Create a Dockerfile:

```dockerfile
FROM codercom/enterprise-base:ubuntu

# Install your tools
RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    python3 \
    && rm -rf /var/lib/apt/lists/*
```

Build and push to your registry:
```bash
docker build -t zot.${SECRET_DOMAIN}/dev-image:latest .
docker push zot.${SECRET_DOMAIN}/dev-image:latest
```

Then update the `image` field in `main.tf`.