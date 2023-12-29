function ExternalSourceTimerCollection() {
	// Collection of various, expirable timers of type ExternalSourceTimer -
	// timers are removed upon expiration.
	this.activeTimers = [];
}


ExternalSourceTimerCollection.prototype.addTimer = function(timer) {
	if (Utility.validateVarAgainstType(timer, ExternalSourceTimer) &&
		!this.timerWithIdExists(timer.identifier)) {

		this.activeTimers.push(timer);
	}
}

ExternalSourceTimerCollection.prototype.removeFirstTimerWithId = function(timerId) {
	var removedTimer = false;

	if (Utility.validateVar(timerId)) {
		var currentTimerIndex = 0;
		while ((currentTimerIndex < this.activeTimers.length) && !removedTimer) {
			if (this.activeTimers[currentTimerIndex].identifier === timerId) {
				var timer = this.activeTimers[currentTimerIndex];
				this.activeTimers.splice(currentTimerIndex, 1);

				var resolvedIdentifier = Utility.validateVar(timer.identifier) ? timer.identifier : "";	
				timer.completionCallback(resolvedIdentifier);

				removedTimer = true;
			}
			
			currentTimerIndex++;
		}		
	}	
}

/**
 * Attempts to locate a timer that has the provided identifier
 *
 * @param timerId {String} Identifier to be matched to an existing timer
 *
 * @return {ExternalSourceTimer} Timer with the specified identifier
 *                               upon success, null otherwise
 */
ExternalSourceTimerCollection.prototype.timerWithId = function (timerId) {
	var timer = null;
	
	if (Utility.validateVar(timerId)) {
		var currentTimerIndex = 0;
		
		while ((currentTimerIndex < this.activeTimers.length) && (timer === null)) {
			if (this.activeTimers[currentTimerIndex].identifier ===
				timerId) {
					
				timer = this.activeTimers[currentTimerIndex];					
			}
			
			currentTimerIndex++;
		}
	}

	return timer;	
}

/**
 * Determines if a timer with the provided identifier exists
 *
 * @param timerId {String} Identifier to be matched to an existing timer
 *
 * @return {Boolean} True if a timer with the provided identifier
 *                   exists
 */
ExternalSourceTimerCollection.prototype.timerWithIdExists = function (timerId) {
	var timerExists = false;
	
	if (Utility.validateVar(timerId)) {
		timerExists = this.timerWithId(timerId) != null;
	}

	return timerExists;
}

/**
 * Updates the collection of externally-driven timers
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 */
ExternalSourceTimerCollection.prototype.updateActiveTimers = function (timeQuantum) {
	var currentTimerIndex = 0;
	
	while (currentTimerIndex < this.activeTimers.length) {
		var currentItemExpired = false;
		if (Utility.validateVarAgainstType(this.activeTimers[currentTimerIndex], ExternalSourceTimer)) {
	
			this.activeTimers[currentTimerIndex].invokeTimerUpdate(timeQuantum);
			currentItemExpired = this.activeTimers[currentTimerIndex].isExpired()
			if (currentItemExpired) {
				this.activeTimers.splice(currentTimerIndex, 1);
			}
		}
		
		if (!currentItemExpired) {
			currentTimerIndex++;
		}
	}
}