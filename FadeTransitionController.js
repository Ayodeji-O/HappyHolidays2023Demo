function FadeTransitionController(fadeTransitionDuration) {
	this.constDefaultFadeTransitionDurationMs = 1500;
	
	// Event that occurs at the start of the initiation of the 
	// transition portion
	this.constTimerIdTransitionEvent = "TimerId_Transition";
	// Event that occurs at the completion of the initiation of
	// the first portion of the transition
	this.constTimerIdTransitionContinuationEvent = "TimerId_TransitionContinuation";

	this.fadeTransitionDuration = null;

	if (Utility.validateVar(fadeTransitionDuration)) {
		this.fadeTransitionDuration = fadeTransitionDuration;
	}
	else {
		this.fadeTransitionDuration = this.constDefaultFadeTransitionDurationMs;
	}

	this.timers = new ExternalSourceTimerCollection();
}


FadeTransitionController.prototype.invokeTransition = function(completionCallback) {
	if (!this.timers.timerWithIdExists(this.constTimerIdTransitionEvent)) {	
		var sceneInstance = this;
		this.timers.addTimer(new ExternalSourceTimer(
			this.fadeTransitionDuration,
			function () {
				if (Utility.validateVar(completionCallback)) {
					completionCallback();
				}
			},
			this.constTimerIdTransitionEvent,
			function () {
			})
		);
	}
}

FadeTransitionController.prototype.invokeTransitionContinuation = function(completionCallback) {
	if (!this.timers.timerWithIdExists(this.constTimerIdTransitionContinuationEvent)) {
		this.teddyProtagonistIsInvulnerable = true;
		
		var sceneInstance = this;
		this.timers.addTimer(new ExternalSourceTimer(
			this.fadeTransitionDuration,
			function () {
				if (Utility.validateVar(completionCallback)) {
					completionCallback();
				}				
			},
			this.constTimerIdTransitionContinuationEvent,
			function () {
			})
		);
	}
}

FadeTransitionController.prototype.isTransitionInProgress = function() {
	return this.timers.timerWithIdExists(this.constTimerIdTransitionEvent) ||
	this.timers.timerWithIdExists(this.constTimerIdTransitionContinuationEvent);
}

/**
 * Determines the immediate completion fraction of an
 *  active "fade to black" transition
 *
 * @return {Number} Fade to black transition completion fraction
 *                  (0.0 if no transition is in progress)
 */
FadeTransitionController.prototype.getBlackFadeFraction = function () {
	var fadeFraction = 1.0;
	
	if (this.timers.timerWithIdExists(this.constTimerIdTransitionEvent)) {
		// Fade out
		var levelTransitionTimer = this.timers.timerWithId(this.constTimerIdTransitionEvent);
		
		fadeFraction = (levelTransitionTimer.elapsedTimeMs / levelTransitionTimer.targetDurationMs);
	}
	else if (this.timers.timerWithIdExists(this.constTimerIdTransitionContinuationEvent)) {
		// Fade in
		var levelTransitionTimer = this.timers.timerWithId(this.constTimerIdTransitionContinuationEvent);
		
		fadeFraction = 1.0 - (levelTransitionTimer.elapsedTimeMs / levelTransitionTimer.targetDurationMs);		
	}

	return fadeFraction;
}

FadeTransitionController.prototype.updateTransitionWithTimeQuantum = function(timeQuantum) {
	this.timers.updateActiveTimers(timeQuantum);
}