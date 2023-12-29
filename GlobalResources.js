// GlobalResources.js - Contains resources that are accessible
//                      from all areas of the demo
// Author: Ayodeji Oshinnaiye
// Dependent upon:
//  -Utility.js
//  -ResourceLoader.js
//  -WebGlUtility.js

function globalResources() {}

globalResources.resourceCatalogUri = "resourceCatalog/ResourceCatalog.json";
globalResources.introImageUri = "images/HappyHolidays2023Intro.jpg"
globalResources.audioBackgroundMusicKey = "keyAudioBackgroundMusic";

/**
 * Initializes the global resources, loading
 *  any resources that require pre-loading
 * @param completionFuction {function} Completion function executed
 *                                     upon completion of all global
 *                                     resource loading
 */
globalResources.initialize = function(completionFunction) {

	this.textureKeyValueStore = {};
	this.textureSizeKeyValueStore = {};
	
	this.audioDataSourceKeys = [];
	
	this.decodedAudioDataKeyValueStore = {};
	this.processedAudioDataSourceCount = 0;

	this.textureSourceKeys = [];

	this.processedAudioDataSourceCount = 0;

	function mainResourceLoadCompletionFunction () {
		completionFunction();
		//globalResources.loadTextureResources(globalResources.internalImageLoadProgressFunction, completionFunction,
		//	globalResources.getMainCanvasContext());
	}
	
	this.loadResources(completionFunction);	
}

/**
 * Initiates the resource loading process
 *
 * @param completionFunction A function that will be invoked
 *                           after all resource load attempts have
 *                           been completed (regardless of success
 *                           or failure)
 */
globalResources.loadResources = function(completionFunction) {	
	var httpRequest = new XMLHttpRequest();
	httpRequest.onload = function() {
		var parser = new ResourceCatalogParser();
		if ((typeof httpRequest.response === "string") && 
			(httpRequest.response.trim().length > 0)
		) {
			var parsedCatalog = parser.parseCataog(httpRequest.response);
			globalResources.loadResourcesWithCatalog(parsedCatalog, completionFunction);
		}
	}

	httpRequest.open("GET", globalResources.resourceCatalogUri);
	httpRequest.send();
}

globalResources.loadResourcesWithCatalog = function(resourceCatalog, completionFunction) {	
	var resourceLoader = new ResourceLoader();

	this.lastNonTextureProgressFraction = 0.0;
	this.lastTextureProgressFraction = 0.0;

	var nonTextureResources = resourceCatalog.filter((resourceSpec) => !globalResources.isTextureResourceSpec(resourceSpec));
	var textureResources = resourceCatalog.filter((resourceSpec) => globalResources.isTextureResourceSpec(resourceSpec));
	globalResources.storeBackgroundAudioResourceKeys(resourceCatalog);

	var resourceLoadProgressFunction = globalResources.generateInternalResourceLoadProgressFunction(
		nonTextureResources.length, textureResources.length);
	var imageLoadProgressFunction = globalResources.generateInternalImageLoadProgressFunction(
		nonTextureResources.length, textureResources.length);
	// The progress function will be invoked after each resource has been
	// loaded (function will receive a fractional progress indicator).
	if (Utility.validateVar(resourceLoadProgressFunction)) {
		resourceLoader.setProgressFunction(resourceLoadProgressFunction);
	}

	globalResources.setupNonTextureResourceLoading(nonTextureResources, resourceLoader);

	globalResources.loadTextureResources(textureResources, imageLoadProgressFunction,
		resourceLoadCompletionHandler, globalResources.getMainCanvasContext());

	var resourceLoadCompletionFunction = completionFunction;
	var resourceLoadCompletionHandler = function (loadedResourceKeyValueStore) {
		globalResources.onResourceLoadCompletion(loadedResourceKeyValueStore);
		
		// !!!!Remove this function call instance when image loading is configured...
		resourceLoadCompletionFunction();

		function imageCompletionFunction() {
			// Decode any audio data as required (e.g. background music).
			resourceLoadCompletionFunction();
		}
		
		// image.onload = ....
		// image.src = ...
	}
	
	resourceLoader.initiateResourceLoading(resourceLoadCompletionHandler);
}

globalResources.storeBackgroundAudioResourceKeys = function(resourceCatalog) {
	if (Utility.validateVar(resourceCatalog)) {
		var backgroundAudioResources = resourceCatalog.filter((resourceSpec) =>
			globalResources.isBackgroundAudioResourceSpec(resourceSpec));

		for (var currentResourceSpec of backgroundAudioResources) {
			this.audioDataSourceKeys.push(currentResourceSpec.key);
		}
	}
}

globalResources.isTextureResourceSpec = function(resourceSpec) {
	return Utility.validateVar(resourceSpec.resourceType) &&
		(resourceSpec.resourceType === ResourceCatalogParser.resourceTypeSpecifierTexture)
}

globalResources.isBackgroundAudioResourceSpec = function(resourceSpec) {
	return Utility.validateVar(resourceSpec.resourceType) &&
		(resourceSpec.resourceType === ResourceCatalogParser.resourceTypeSpecifierBackgroundAudio)	
}

globalResources.setupNonTextureResourceLoading = function(resourceSpecCollection, resourceLoader) {	
	for (var currentResourceSpec of resourceSpecCollection) {
		var currentResourceKey = currentResourceSpec.key
		// Images/textures are loaded/decoded by a separate routine.
		if (!Utility.validateVar(currentResourceSpec.resourceType) ||
			(currentResourceSpec.resourceType !== ResourceCatalogParser.resourceTypeSpecifierTexture)
		) {
			var resourceIsBinaryData = (Utility.validateVar(currentResourceSpec.binaryFlag) && 
				(currentResourceSpec.binaryFlag === true));
			
			if (Utility.validateVar(currentResourceSpec.uri)) {
				resourceLoader.addResourceSourceUri(currentResourceKey, currentResourceSpec.uri,
					resourceIsBinaryData);
			}
		}
	}	
}

globalResources.loadTextureResources = function(resourceSpecCollection, progressFunction, completionFunction, webGlCanvasContext) {
	var totalImageCount = resourceSpecCollection.length;
	var loadedImageCount = 0;
	
	if (resourceSpecCollection.length > 0) {
		for (var currentResourceSpec of resourceSpecCollection) {
			var currentImage = new Image();
			currentImage.src = currentResourceSpec.uri;
			var textureSourceKey = currentResourceSpec.key;
			
			var makeOnLoadFunction = function(textureSourceKey) {
				var onLoadFunction = function () {			
					var imageTexture = WebGlUtility.createTextureFromImage(webGlCanvasContext, this, false);
					globalResources.textureKeyValueStore[textureSourceKey] = imageTexture;
					globalResources.textureSizeKeyValueStore[textureSourceKey] = [ this.width, this.height ];
					
					loadedImageCount++;
					if (typeof progressFunction === "function") {
						progressFunction(loadedImageCount / totalImageCount);
					}
					
					if ((loadedImageCount === totalImageCount) &&
						(typeof completionFunction === "function")) {
							
						completionFunction();				
					}
				};
				
				return onLoadFunction;			
			};
			
			currentImage.onload = makeOnLoadFunction(textureSourceKey);
		}
	}
	else if (typeof completionFunction === "function") {
		completionFunction();
	}
}

/**
 * Sets the function that will receive progress
 *  events
 *
 * @param {function} A function that will receive a single,
 *                   number parameter between 0.0 - 1.0, inclusive,
 *                   representing the load progress.
 *
 */
globalResources.setLoadProgressFunction = function (progressFunction) {
	if (Utility.validateVar(progressFunction)) {		
		this.progressFunction = progressFunction;
	}
}

/**
 * Retrieves loaded resource data using a key in order
 *  to reference data within the internal key/value store
 * @param loadedResourceDataKey {String} Key into the key-value
 *                                       store containing loaded
 *                                       data
 *
 * @return {LoadedResourceData} Data associated with a loaded resource
 */
globalResources.getLoadedResourceDataByKey = function(loadedResourceDataKey) {
	return this.loadedResourceKeyValueStore[loadedResourceDataKey];
}

/**
 * Handler invoked after loading has been attempted/completed for
 *  all resources
 * 
 * @param loadedResourceKeyValueStore {Object} A key/value store containing all
 *                                             loaded resources
 */
globalResources.onResourceLoadCompletion = function (loadedResourceKeyValueStore) {
	this.loadedResourceKeyValueStore = loadedResourceKeyValueStore;
}


globalResources.generateInternalResourceLoadProgressFunction = function (nonTextureResourceCount, textureResourceCount) {
	return function(progressFraction) {
		if (typeof globalResources.progressFunction === "function") {		
			var absoluteProgressFraction = progressFraction *
				(nonTextureResourceCount / (textureResourceCount + nonTextureResourceCount));
			globalResources.lastNonTextureProgressFraction = absoluteProgressFraction;
			globalResources.progressFunction(absoluteProgressFraction + globalResources.lastTextureProgressFraction);
		}
	}
}

globalResources.generateInternalImageLoadProgressFunction = function (nonTextureResourceCount, textureResourceCount) {
	return function(progressFraction) {
		if (typeof globalResources.progressFunction === "function") {
			
			var absoluteProgressFraction = progressFraction *
				(textureResourceCount / (textureResourceCount + nonTextureResourceCount));
			globalResources.lastTextureProgressFraction = absoluteProgressFraction;
			globalResources.progressFunction(absoluteProgressFraction + globalResources.lastNonTextureProgressFraction);
		}
	}
}

/**
 * Decodes all loaded audio data
 *
 * @param completionFunction {Function} Completion function invoked after all
 *                                      audio data has been decoded
 */
globalResources.decodeAllAudioData = function(completionFunction) {
	for (var currentAudioDataKeyIndex = 0; currentAudioDataKeyIndex < this.audioDataSourceKeys.length; currentAudioDataKeyIndex++) {
		
		var decodeTargetAudioDataKeyIndex = currentAudioDataKeyIndex;
		function decodeSuccessCallback(audioBuffer) {
			// Audio has been decoded successfully - store the buffer, and
			// invoke the provided completion function if decoding attempts
			// have been performed on all audio buffers.
			globalResources.decodedAudioDataKeyValueStore[globalResources.audioDataSourceKeys[decodeTargetAudioDataKeyIndex]] = audioBuffer;
			
			globalResources.processedAudioDataSourceCount++
			
			if ((globalResources.processedAudioDataSourceCount == globalResources.audioDataSourceKeys.length) &&
				Utility.validateVar(completionFunction)) {
					
				completionFunction();
			}
		}
		
		function decodeErrorCallBack(audioBuffer) {
			this.processedAudioDataSourceCount++			
		}
		
		// Decode the audio data...
		audioContext = globalResources.createAudioContext();
		if (Utility.validateVar(audioContext) && Utility.validateVar(this.loadedResourceKeyValueStore) &&
			Utility.validateVar(this.loadedResourceKeyValueStore[this.audioDataSourceKeys[currentAudioDataKeyIndex]])) {

			var encodedAudioData = this.loadedResourceKeyValueStore[this.audioDataSourceKeys[currentAudioDataKeyIndex]].resourceDataStore;
			audioContext.decodeAudioData(encodedAudioData, decodeSuccessCallback, decodeErrorCallBack);
		}
	}
}

/**
 *  Creates an AudioContext object that will be required
 *   to play the background audio
 *  
 *  @return {AudioContext} AudioContext object required to play
 *                         the background audio
 */
globalResources.createAudioContext = function() {
	var audioContext = null;
	if (typeof(window.AudioContext) !== "undefined") {
		audioContext = new window.AudioContext();
	}
	else {
		// Used by Safari (validated against version 12.x)
		audioContext = new window.webkitAudioContext();
	}
	
	return audioContext;
}

/**
 *  Initiates playback of the background audio - this method must
 *   be invoked from within a click event handler in order for
 *   the audio to be played on all supported browsers (it should not
 *   be invoked an any other handler, even if the request being
 *   handled was invoked from within the click handler)
 */
globalResources.playBackgroundAudio = function() {
	globalResources.audioContext = globalResources.createAudioContext();
	globalResources.audioContext.resume();
	if (globalResources.audioContext !== null) {	
		function initiateBackgroundAudioPlayback() {
			if (Utility.validateVar(globalResources.decodedAudioDataKeyValueStore[globalResources.audioBackgroundMusicKey])) {
				var audioSource = globalResources.audioContext.createBufferSource();
				audioSource.buffer = globalResources.decodedAudioDataKeyValueStore[globalResources.audioBackgroundMusicKey];
				audioSource.connect(globalResources.audioContext.destination);
				audioSource.loop = true;
				audioSource.start(0);
			}
		}
			
		globalResources.decodeAllAudioData(initiateBackgroundAudioPlayback);
	}
}

globalResources.conditionallyRequestAccelerometerPermission = function(completionFunction) {

	if ((typeof(DeviceOrientationEvent) !== "undefined") && typeof(DeviceOrientationEvent.requestPermission) === "function") {
		// Standard method for requesting accelerometer permission under
		// Safari.
		DeviceOrientationEvent.requestPermission().then(response => {
			completionFunction();
		});
	}	
	else if (Utility.validateVar(completionFunction)) {
		completionFunction()
	}
}

globalResources.conditionallyRequestGyroscopePermission = function(completionFunction) {
	if ((typeof(DeviceMotionEvent) !== "undefined") && typeof(DeviceMotionEvent.requestPermission) === "function") {
		// Standard method for requesting gyroscope permission under
		// Safari.
		DeviceMotionEvent.requestPermission().then(response => {
			completionFunction();
		});
	}
	else if (Utility.validateVar(completionFunction)) {
		completionFunction()
	}	
}



/**
 * Retrieves the "main" canvas context used for drawing data
 *  to the browser window
 * @return {CanvasRenderingContext2D / WebGLRenderingContext}
 *			The canvas context used for drawing data to the
 *			browser window
 */
globalResources.getMainCanvasContext = function() {
	return typeof this.mainCanvasContext !== "undefined" ?
		this.mainCanvasContext : null;
}

/**
 * Retrieves the overlay canvas context used for drawing data
 *  to the browser window (gauge)
 * @return {CanvasRenderingContext2D / WebGLRenderingContext}
 *			The canvas context used for drawing to be
 *			superimposed on the main canvas
 */
globalResources.getGaugeOverlayCanvasContext = function() {
	return typeof this.gaugeOverlayCanvasContext !== "undefined" ?
		this.gaugeOverlayCanvasContext : null;
}


/*
 * Retrieves the overlay canvas context used for drawing data
 *  to the browser window (full screen data)
 * @return {CanvasRenderingContext2D / WebGLRenderingContext}
 *			The canvas context used for drawing to be
 *			superimposed on the main canvas
 */
globalResources.getFullScreenOverlayCanvasContext = function() {
	return typeof this.fullScreenOverlayCanvasContext !== "undefined" ?
		this.fullScreenOverlayCanvasContext : null;
}

/**
 * Sets the "main" canvas context used for drawing data to the
 *  browser window
 * @param mainCanvasContext {CanvasRenderingContext2D / WebGLRenderingContext}
 *						    The canvas context the
 *                          will be retrieved for drawing data to the browser
 *                          window
 */
globalResources.setMainCanvasContext = function(mainCanvasContext) {
	this.mainCanvasContext = mainCanvasContext;
}

/**
 * Sets the overlay canvas context used for drawing data that is
 *  to be superimposed on the main canvas (gauge)
 * @param overlayCanvasContext {CanvasRenderingContext2D / WebGLRenderingContext}
 *						       The canvas context that will be retrieved for
 *                             drawing data over the main canvas
 */
globalResources.setGaugeOverlayCanvasContext = function(overlayCanvasContext) {
	this.gaugeOverlayCanvasContext = overlayCanvasContext;
}

/**
 * Sets the overlay texture used for drawing data that is
 *  to be superimposed on the main scene (gauge)
 * @param overlayTexture {WebGLTexture} The texture that is to be used
 *                                      as an overlay texture
 */
globalResources.setGaugeOverlayTexture = function(overlayTexture) {
	this.gaugeOverlayTexture = overlayTexture;
}

/**
 *  Retrieves the overlay texture used for superimposing data
 *   that is to be drawn over the main scene (gauge)
 *  
 *  @return {WebGLTexture} The texture that is to be used
 *                         as the overlay texture
 */
globalResources.getGaugeOverlayTexture = function() {
	return this.gaugeOverlayTexture;


}

/**
 * Sets the overlay canvas context used for drawing data that is
 *  to be superimposed on the main canvas (full screen data)
 * @param overlayCanvasContext {CanvasRenderingContext2D / WebGLRenderingContext}
 *						       The canvas context that will be retrieved for
 *                             drawing data over the main canvas
 */
globalResources.setFullScreenOverlayCanvasContext = function(overlayCanvasContext) {
	this.fullScreenOverlayCanvasContext = overlayCanvasContext;
}
	
/**
 *  Retrieves the overlay texture used for superimposing data
 *   that is to be drawn over the main scene (full screen data)
 */
globalResources.getFullScreenOverlayTexture = function() {
	return this.fullScreenOverlayTexture;
}

/**
 * Sets the overlay texture used for drawing data that is
 *  to be superimposed on the main scene (full screen data)
 * @param overlayTexture {WebGLTexture} The texture that is to be used
 *                                      as an overlay texture
 */
globalResources.setFullScreenOverlayTexture = function(overlayTexture) {
	this.fullScreenOverlayTexture = overlayTexture;
}

/**
 * Retrieves the URI of the intro image
 * @return {String} The URI of the intro image
 */
globalResources.getIntroImageUri = function () {
	return globalResources.introImageUri;
}