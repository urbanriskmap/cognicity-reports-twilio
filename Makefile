lambda:
	npm install
	@echo "Factory package files..."
	@if [ ! -d build ] ;then mkdir build; fi
	@cp index.js build/index.js
	@if [ -d build/node_modules ] ;then rm -rf build/node_modules; fi
	@cp -R node_modules build/node_modules
	@echo "Create package archive..."
	@cd build && zip -rq -9 ../cognicity-reports-twilio.zip .
