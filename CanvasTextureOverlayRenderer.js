function CanvasTextureOverlayRenderer(contentGenerator) {
	this.overlayCanvas = document.createElement("canvas");
	this.contentGenerator = contentGenerator;
	this.contentGenerated = false;
	this.overlayRenderWebGlData = null;
}

CanvasTextureOverlayRenderer.prototype.initialize = function(webGlCanvasContext, width, height,
	renderSpaceWidth, renderSpaceHeight, renderSpaceCenterX, renderSpaceCenterY
) {
	if (Utility.validateVar(webGlCanvasContext) && Utility.validateVar(width) &&
		Utility.validateVar(height) && (this.overlayRenderWebGlData === null)
	) {
		this.overlayCanvas.width = width;
		this.overlayCanvas.height = height;
		this.overlayCanvasContext = this.overlayCanvas.getContext("2d");
		
		this.overlayTexture = WebGlUtility.createTextureFromCanvas(webGlCanvasContext,
			this.overlayCanvas, false);
			
		var constVertexSize = 3;

		var overlayQuadVertices = WebGlUtility.quadCoordArray(renderSpaceWidth, renderSpaceHeight,
			renderSpaceCenterX, renderSpaceCenterY, -1.0)
		
		var webGlBufferData = new WebGlUtility.WebGlBufferData();
		
		webGlBufferData.objectWebGlVertexBuffer = WebGlUtility.createWebGlBufferFromData(webGlCanvasContext,
			overlayQuadVertices);
		webGlBufferData.objectWebGlTexCoordBuffer = WebGlUtility.createWebGlBufferFromData(webGlCanvasContext,
			WebGlUtility.zPlaneQuadTextureCoords());

		webGlBufferData.vertexCount = overlayQuadVertices.length / constVertexSize;	
		
		this.overlayRenderWebGlData = webGlBufferData;			
	}
}

CanvasTextureOverlayRenderer.prototype.renderOverlay = function(targetCanvasContext, webGlAttributeLocationData,
	webGlAttributeData, overlayTextureRenderShader
) {
	if (typeof this.contentGenerator === "function" && !this.contentGenerated) {
		this.overlayCanvasContext.clearRect(0, 0, this.overlayCanvasContext.canvas.width, this.overlayCanvasContext.canvas.height);;
		this.contentGenerator(targetCanvasContext, this.overlayCanvasContext,
			this.overlayTexture);

		WebGlUtility.updateDynamicTextureWithCanvas(targetCanvasContext, this.overlayTexture,
			this.overlayCanvasContext.canvas);

		this.contentGenerated = true;
	}

	var constTransformationMatrixRowCount = 4;
	var constTransformationMatrixColumnCount = 4;

	var overlayRenderWebGlData = WebGlUtility.objectRenderWebGlDataFromWebGlBufferData(
		this.overlayRenderWebGlData, overlayTextureRenderShader);

	var transformationMatrix = new MathExt.Matrix(constTransformationMatrixRowCount,
		constTransformationMatrixColumnCount);
	transformationMatrix.setToIdentity();
	WebGlUtility.renderGeometry(overlayRenderWebGlData, transformationMatrix, transformationMatrix,
		this.overlayTexture, targetCanvasContext, webGlAttributeLocationData, webGlAttributeData);
}

CanvasTextureOverlayRenderer.prototype.setContentNeedsUpdate = function (needsUpdate) {
	if (Utility.validateVar(needsUpdate) && needsUpdate) {
		this.contentGenerated = false;
	}
}
