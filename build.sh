echo "running build script"

git clone https://github.com/darkwire/darkwire-client.git

cd darkwire-client

yarn

SKIP_PREFLIGHT_CHECK=true yarn react-scripts build

cd ../