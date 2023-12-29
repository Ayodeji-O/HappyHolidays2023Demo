function GameRenderStateUtility() {
	// Frame render interval for the invulnerability "blink"
	// effect.
	this.protagonistInvulnerabilityFrameRenderInterval = 1;
	
	// Number of frames rendered since the last
	// invulnerability effect frame was rendered.
	this.framesRenderedSinceLastInvulnerabilityFrame = 0;
}

GameRenderStateUtility.prototype.incrementInvulnerabilityFrameCount = function () {
	if (this.framesRenderedSinceLastInvulnerabilityFrame >= this.protagonistInvulnerabilityFrameRenderInterval) {
		this.framesRenderedSinceLastInvulnerabilityFrame = 0;
	}
	else {
		this.framesRenderedSinceLastInvulnerabilityFrame++;
	}
}

GameRenderStateUtility.prototype.resetInvulnerabilityFrameCount = function () {
	
}

GameRenderStateUtility.prototype.shouldRenderProtagonist = function(timeQuantum, targetCanvasContext) {
	return (this.framesRenderedSinceLastInvulnerabilityFrame < this.protagonistInvulnerabilityFrameRenderInterval);
}