/**
 * Stores information pertaining to dynamic
 *  object instances that are rendered within a
 *  scene
 */
function DynamicItemInstanceData() {
	// Unique identifier for this instance
	this.uniqueId = Utility.getRandomIdentifier();
	
	// Key used to access source model data within
	// key/value store
	this.modelDataKey = "";
	// Immediate position of the model in world
	// space
	this.modelWorldSpacePosition = new Point3d();
	// Immediate object velocity vector (meters/second)
	this.velocityVector = new Vector3d(0.0, 0.0, 0.0);

	// Dictionary used to store auxiliary, type/instance-
	// specific data
	this.auxDataKeyValueStore = {};
}


/**
 * Dynamic instance data that pertains specifically
 *  to enemy objects
 * @see DynamicItemInstanceData
 */
function EnemyInstanceData () {
	DynamicItemInstanceData.call(this);
	
	this.contactDamage = 0.0;
	this.movementPatternSpecifier = 0;
	this.actionIntervalMs = null;
}

function GameState() {
	// Game environment operation state specifiers
	this.constOperationStateActive = 0;
	this.constOperationStateInterLevelPause = 1;
	this.constOperationStateInterLevelPauseCompletion = 2;
	this.constOperationStateInactive = 3;
		
	this.operationState = this.constOperationStateInactive;
	
	this.timers = new ExternalSourceTimerCollection();
	
	this.currentLevelIndex = 0;
	this.levelCount = 0;
	
	this.currentProtagonistFortitudeValue = 0;
	this.maxProtagonistFortitudeValue = 0;
	this.minProtagonistFortitudeValue = 0;
		
	this.protagonistIsInvulnerable = false;	
	
	this.constTimerIdGeneralInvulnerabilityEvent = "TimerId_GeneralInvulnerability";	
}

GameState.prototype.setMaxProtagonistFortitudeValue = function (maxFortitudeValue) {
	if (Utility.validateVar(maxFortitudeValue)) {
		this.maxProtagonistFortitudeValue = maxFortitudeValue;
	}
}

GameState.prototype.setMinProtagonistFortitudeValue = function (minFortitudeValue) {
	if (Utility.validateVar(minFortitudeValue)) {
		this.minProtagonistFortitudeValue = minFortitudeValue;
	}
}

GameState.prototype.setCurrentProtagonistFortitudeValue = function (currentFortitudeValue) {
	if (Utility.validateVar(currentFortitudeValue)) {
		this.currentProtagonistFortitudeValue =
			Utility.returnValidNumOrZero(currentFortitudeValue);
	}
}

GameState.prototype.applyProtagonistDamage = function (damageValue) {
	this.currentProtagonistFortitudeValue =
		Math.max(this.currentProtagonistFortitudeValue - damageValue, this.minProtagonistFortitudeValue);
}

GameState.prototype.isAtNonViableFortitudeValue = function () {
	return this.currentProtagonistFortitudeValue <= this.minProtagonistFortitudeValue;
}

/**
 * Invokes a period of invulnerability, of a pre-determined duration, to
 *  the protagonist (general invulnerability)
 *
 */
GameState.prototype.invokeProtagonistGeneralInvulnerabilityPeriod = function (invulnerabilityDurationMs) {
	this.timers.removeFirstTimerWithId(this.constTimerIdGeneralInvulnerabilityEvent);

	this.protagonistIsInvulnerable = true;
	
	var gameStateInstance = this;
	this.timers.addTimer(new ExternalSourceTimer(
		invulnerabilityDurationMs,
		function () {
			gameStateInstance.protagonistIsInvulnerable = false;
		},
		this.constTimerIdGeneralInvulnerabilityEvent,
		null)
	);	
}

/**
 * Applies a game operational state specifier
 */
GameState.prototype.setOperationState = function (newOperationState) {
	if (Utility.validateVar(newOperationState)) {
		this.operationState = newOperationState;
	}
}

GameState.prototype.setCurrentLevelIndex = function (newLevelIndex) {
	if (Utility.validateVar(newLevelIndex)) {
		this.currentLevelIndex = Utility.returnValidNumOrZero(newLevelIndex);
	}
}

GameState.prototype.setLevelCount = function (levelCount) {
	if (Utility.validateVar(levelCount) && Utility.returnValidNumOrZero(levelCount) >= 0) {
		this.levelCount = Utility.returnValidNumOrZero(levelCount);
	}
}

/**
 * The determine if the game is in a non-completion, non-paused,
 *  active state
 *
 * @return True if the game is immediately in an active state
 */
GameState.prototype.isInActiveOperationState = function () {
	return this.operationState === this.constOperationStateActive;
}

GameState.prototype.isInterLevelPauseState = function () {
	return (this.operationState === this.constOperationStateInterLevelPause);
}

/**
 * Determines if the game has recently concluded unsuccessfully
 *
 * @return {Boolean} True if a game over state is active
 */
GameState.prototype.isInGameOverState = function () {
	return (!this.isInActiveOperationState() && this.isAtNonViableFortitudeValue());
}

/**
 * Determines if the game has been successfully completed
 *
 * @return {Boolean} True if the game has been successfully completed
 */
GameState.prototype.isInGameCompletionState = function () {
	var finalLevelCompleted = (this.operationState === this.constOperationStateInterLevelPause) &&
		(this.currentLevelIndex >= (this.levelCount - 1));
	
	return (!this.isInActiveOperationState() && finalLevelCompleted &&
		(this.currentProtagonistFortitudeValue > this.minProtagonistFortitudeValue));
}

GameState.prototype.updateGameStateWithTimeQuantum = function(timeQuantum) {
	this.timers.updateActiveTimers(timeQuantum);
}