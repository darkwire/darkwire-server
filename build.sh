echo "building client..."
git clone https://github.com/darkwire/darkwire-client.git
cd darkwire-client
yarn
SKIP_PREFLIGHT_CHECK=true yarn react-scripts build

echo "building server..."
cd ../
rm -rf build
rm -rf dist
babel src -d dist/src --copy-files