// ExternalSourceTimer.js - Implements a timer driven by an external clock source
//
// Dependent upon:
//  -Utility.js
//  -FadeController.js

function FadeOverlayRenderer (fadeTransitionController) {
	this.fadeTransitionController = fadeTransitionController;
	this.fadeOverlayContentHasBeenGenerated = false;
}

/**
 * Generates contents of the texture that will be used within the
 *  fade to black overlay implementation
 */
FadeOverlayRenderer.prototype.generateFadeOverlayContent = function(webGlCanvasContext,
																			   targetCanvasContext,
																			   targetTexture) {
	if (Utility.validateVar(webGlCanvasContext) && Utility.validateVar(targetCanvasContext) &&
		Utility.validateVar(targetTexture)) {
			
		targetCanvasContext.clearRect(0, 0, targetCanvasContext.canvas.width, targetCanvasContext.canvas.height);

		WebGlUtility.updateDynamicTextureWithCanvas(webGlCanvasContext, targetTexture, targetCanvasContext.canvas);
	}
}


/**
 * Renders the overlay used to employ a "fade" transition
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 */
FadeOverlayRenderer.prototype.renderFadeOverlay = function(timeQuantum, targetCanvasContext, fadeOverlayTexture,
	fullScreenOverlayWebGlData, fadeOverlayShader, webGlAttributeData, webGlAttributeLocationData
) {
	var constTransformationMatrixRowCount = 4;
	var constTransformationMatrixColumnCount = 4;

	if (Utility.validateVar(this.fadeTransitionController) && this.fadeTransitionController.isTransitionInProgress()) {
		var fadeOverlayCanvasContext = globalResources.getFullScreenOverlayCanvasContext();
		
		if (!this.fadeOverlayContentHasBeenGenerated) {
			this.generateFadeOverlayContent(targetCanvasContext, fadeOverlayCanvasContext,
				fadeOverlayTexture);
			this.fadeOverlayContentHasBeenGenerated = true;
		}
		
		var overlayRenderWebGlData = WebGlUtility.objectRenderWebGlDataFromWebGlBufferData(
			fullScreenOverlayWebGlData, fadeOverlayShader);
		
		var transformationMatrix = new MathExt.Matrix(constTransformationMatrixRowCount,
			constTransformationMatrixColumnCount);
		transformationMatrix.setToIdentity();

		var fadeFraction = this.fadeTransitionController.getBlackFadeFraction();
		function fadeUniformSetupFadeFraction(shaderProgram) {
			var fadeFractionUniformLocation = targetCanvasContext.getUniformLocation(shaderProgram, "fadeFraction");
				targetCanvasContext.uniform1f(fadeFractionUniformLocation, fadeFraction);
		}
		
		WebGlUtility.renderGeometry(overlayRenderWebGlData, transformationMatrix, transformationMatrix,
			fadeOverlayTexture, targetCanvasContext, webGlAttributeLocationData, webGlAttributeData,
			fadeUniformSetupFadeFraction);
	}
}