
function SpiritMeterRenderer(width, height, canvasClearColor, spiritMeterMinValueColor, spiritMeterMaxValueColor, spiritMeterOutlineColor) {
	this.width = Utility.returnValidNumOrZero(width);
	this.height = Utility.returnValidNumOrZero(height);

	this.canvasClearColor = canvasClearColor;
	this.spiritMeterMinValueColor = spiritMeterMinValueColor;
	this.spiritMeterMaxValueColor = spiritMeterMaxValueColor;
	this.spiritMeterOutlineColor = spiritMeterOutlineColor;
	this.meterOverlayCanvas = document.createElement("canvas");
	this.meterOverlayCanvas.width = this.width;
	this.meterOverlayCanvas.height = this.height;
	this.meterOverlayCanvasContext = this.meterOverlayCanvas.getContext("2d");
	this.meterOverlayRenderWebGlData = null;
	this.meterOverlayTexture = null;
}

SpiritMeterRenderer.prototype.initialize = function (targetCanvasContext, renderSpaceWidth, renderSpaceHeight,
	renderSpaceCenterX, renderSpaceCenterY
) {
	if (this.meterOverlayTexture === null) {
		var constVertexSize = 3;
		
		this.meterOverlayTexture = WebGlUtility.createTextureFromCanvas(targetCanvasContext,
			this.meterOverlayCanvas, false);

		var overlayQuadVertices = WebGlUtility.quadCoordArray(renderSpaceWidth, renderSpaceHeight,
			renderSpaceCenterX, renderSpaceCenterY, -1.0)
		
		var webGlBufferData = new WebGlUtility.WebGlBufferData();
		
		webGlBufferData.objectWebGlVertexBuffer = WebGlUtility.createWebGlBufferFromData(targetCanvasContext,
			overlayQuadVertices);
		webGlBufferData.objectWebGlTexCoordBuffer = WebGlUtility.createWebGlBufferFromData(targetCanvasContext,
			WebGlUtility.zPlaneQuadTextureCoords());

		webGlBufferData.vertexCount = overlayQuadVertices.length / constVertexSize;	
		
		this.meterOverlayRenderWebGlData = webGlBufferData;
	
		this.drawSpiritMeterToTexture(targetCanvasContext);
	}
}

/**
 * Renders the Spirit meter overlay
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 * @param webGlAttributeLocationData {WebGlUtility.AttributeLocationData} attributeLocationData
 * @param shaderProgram

 */
SpiritMeterRenderer.prototype.renderSpiritMeterOverlay = function(timeQuantum, targetCanvasContext,
	unitSpiritMagnitude, webGlAttributeLocationData, webGlAttributeData, shaderProgram
) {	
	var constTransformationMatrixRowCount = 4;
	var constTransformationMatrixColumnCount = 4;

	var spiritMeterOverlayTexture = this.meterOverlayTexture;
	
	var overlayRenderWebGlData = WebGlUtility.objectRenderWebGlDataFromWebGlBufferData(	
		this.meterOverlayRenderWebGlData, shaderProgram);
	
	var transformationMatrix = new MathExt.Matrix(constTransformationMatrixRowCount,
		constTransformationMatrixColumnCount);
	transformationMatrix.setToIdentity();
	

	//var webGlAttributeLocationData = getStandardShaderWebGlAttributeLocations(true);
	//var webGlAttributeData = getDefaultWebGlAttributeData();
	
	WebGlUtility.renderGeometry(overlayRenderWebGlData, transformationMatrix, transformationMatrix,
		spiritMeterOverlayTexture, targetCanvasContext, webGlAttributeLocationData, webGlAttributeData,
		this.renderSpiritMeterUniformSetupFunction(targetCanvasContext, "spiritMeter", unitSpiritMagnitude, this));
}

SpiritMeterRenderer.prototype.renderSpiritMeterUniformSetupFunction = function(targetCanvasContext, lookUpKey, unitSpiritMagnitude, sceneInstance) {
	return function (shaderProgram) {
		var displayFractionUniformLocation = WebGlUtility.getUniformLocation(targetCanvasContext,
			shaderProgram, "uniform_displayFraction", null);
		targetCanvasContext.uniform1f(displayFractionUniformLocation, unitSpiritMagnitude);
	}
}

SpiritMeterRenderer.prototype.drawSpiritMeterToTexture = function (webGlCanvasContext) {
	var spiritMeterHeightDifference = 5;
	var spiritMeterHeight = this.meterOverlayCanvasContext.canvas.height - spiritMeterHeightDifference;
	var spiritLabelTrailingMargin = 10.0;
	
	this.meterOverlayCanvasContext.clearRect(0, 0, this.meterOverlayCanvasContext.canvas.width,
		this.meterOverlayCanvasContext.canvas.height);
	this.updateSpiritMeterMagnitudeRepresentation(this.meterOverlayCanvasContext, this.width,
		spiritMeterHeight, 0.0)

	WebGlUtility.updateDynamicTextureWithCanvas(webGlCanvasContext,
		this.meterOverlayTexture, this.meterOverlayCanvasContext.canvas);
}

/**
 * Renders a representation of the immediate spirit meter level into
 *  the provided canvas context
 *
 * @param targetCanvasContext {CanvasRenderingContext2D}  Canvas into which the spirit meter will
 *                                                        be rendered
 * @param spiritMeterWidth {Number} The width of the spirit meter
 * @param spiritMeterHeight {Number} The height of the spirit meter
 * @param spiritMeterOffsetX {Number} The meter offset from the left edge of the screen
 */
SpiritMeterRenderer.prototype.updateSpiritMeterMagnitudeRepresentation = function (targetCanvasContext,
																							  spiritMeterWidth,
																							  spiritMeterHeight,
																							  spiritMeterOffsetX) {

	if (Utility.validateVar(targetCanvasContext) && Utility.validateVar(spiritMeterWidth) &&
		Utility.validateVar(spiritMeterHeight) && Utility.validateVar(spiritMeterOffsetX)) {

		var spiritMeterBorderSizeX = 5;
		var spiritMeterBorderSizeY = 4;
		
		var meterSegmentSpacing = 3;
		var meterSegmentWidth = 7;

		// Erase the existing spirit meter rendering.
		//targetCanvasContext.fillStyle = constCanvasClearColor.getRgbaIntValueAsStandardString();
		targetCanvasContext.fillStyle = this.canvasClearColor.getRgbaIntValueAsStandardString();
		targetCanvasContext.fillRect(spiritMeterOffsetX, 0, spiritMeterWidth,
			spiritMeterHeight);
			
		targetCanvasContext.strokeStyle = this.spiritMeterOutlineColor.getRgbaIntValueAsStandardString();
		targetCanvasContext.strokeRect(spiritMeterOffsetX, 0, spiritMeterWidth, spiritMeterHeight);

		var spiritValueFraction = 1.0;

		var innerMeterLeftCoord = spiritMeterOffsetX + spiritMeterBorderSizeX +
			Math.floor(meterSegmentSpacing / 2.0);
		var innerMeterMaxWidth = spiritMeterWidth - (2 * spiritMeterBorderSizeX);
		var innerMeterWidth = Math.max(0.0, (Math.floor((spiritMeterWidth - (2 * spiritMeterBorderSizeX)) * spiritValueFraction)));
		
		var meterSegmentCount = Math.ceil(innerMeterWidth / (meterSegmentSpacing + meterSegmentWidth));
		var maxMeterSegmentCount = Math.ceil(innerMeterMaxWidth / (meterSegmentSpacing + meterSegmentWidth));
		
		for (var currentSegmentIndex = 0; currentSegmentIndex < meterSegmentCount; currentSegmentIndex++) {
			var colorWeight = Math.pow(currentSegmentIndex / (maxMeterSegmentCount - 1), 0.5);
			var meterColor = this.spiritMeterMinValueColor.blendWithUnitWeight(this.spiritMeterMaxValueColor,
				colorWeight);
			targetCanvasContext.fillStyle = meterColor.getRgbaIntValueAsStandardString();
			var segmentLeadingEdgeX = innerMeterLeftCoord + ((meterSegmentSpacing + meterSegmentWidth) * currentSegmentIndex);
			targetCanvasContext.fillRect(segmentLeadingEdgeX, spiritMeterBorderSizeY, meterSegmentWidth,
				spiritMeterHeight - (2 * spiritMeterBorderSizeY));
		}
	}
}