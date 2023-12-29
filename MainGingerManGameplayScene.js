// Author: Ayodeji Oshinnaiye
// Dependent upon:


/**
 * Dynamic instance data that pertains specifically
 *  to power-up objects
 * @see PowerUpInstanceData
 */
function PowerUpInstanceData () {
	DynamicItemInstanceData.call(this);
	
	this.powerUpType = null;
	this.powerUpValue = null;
	this.durationMs = null;
}

function MainGingerManGameplayScene() {
}

/**
 * Initializes the scene - invoked before scene execution
 * 
 * @param completionFunction {Function} Function to be invoked upon completion
 *                                      of the initialization process
 *
 * @see sceneExecution()
 */
MainGingerManGameplayScene.prototype.initialize = function (completionFunction) {
	this.totalElapsedSceneTimeMs = 0.0;
	
	// Minimum framerate value used internally during
	// time-quantum based evaluations.
	this.constMinEvaluatedFrameRate = 15.0;

	// Maximum time quantum that will be used to evaluate
	// time-quantum based operations
	this.maxExpressibleTimeQuantum = (1.0 / this.constMinEvaluatedFrameRate) * Constants.millisecondsPerSecond;

	// Number of floating point values that comprise a vertex
	this.constVertexSize = 3;
	// Number of floating point values that comprise a vector
	this.constVectorSize = 3;
	// Number of floating point values that comprise a vertex
	// color
	this.constVertexColorSize = 4;
	// Number of floating point values that comprise a texture
	// coordinate
	this.constTextureCoordinateSize = 2;
		
	// 3D-transformation matrix size - 4 x 4
	this.constTransformationMatrixRowCount = 4;
	this.constTransformationMatrixColumnCount = 4;

	// Internal scale factor applied to device acceleration values acquired for protagonist movement
	this.constDeviceAttitudeAccelScaleFactor = 3.0;
	// Exponent for power function applied to acquired unit input values for protagonist movement
	// (reduces sensitivity for low-magnitude inputs).
	this.constDeviceAccelResultExpoFactor = 1.5;

	// Input event receiver - keyboard
	this.keyboardInputEventReceiver = new KeyboardInputEventReceiver(window);

	// Input event receiver - touch
	this.touchInputEventReceiver = new DeviceTouchInputEventReceiver(window);

	// Input event receivers - keyboard, device orientation and device touch.
	this.keyboardInputEventReceiver = new KeyboardInputEventReceiver(window);
	this.deviceAttitudeInputEventReceiver = new DeviceAttitudeInputEventReceiver(window);
	this.touchInputEventReceiver = new DeviceTouchInputEventReceiver(window);
	this.deviceAttitudeInputEventReceiver.setScaleFactor(this.constDeviceAttitudeAccelScaleFactor);

	// Abstractly manages input device binding.
	this.inputEventInterpreter = new InputEventInterpreter();

	// Vector indicating the direction of the
	// ambient light source
	this.constAmbientLightVector = new Float32Array([
		-0.4, -0.3, -0.4
	]);	
	
	// Dimensionless acceleration along the Y-axis that is being
	// explicitly applied to the Ginger Man protagonist (corresponds
	// directly to the associated input magnitude).
	this.currentGingerManProtagonistUnitAccelerationAxisY = 0.0;
		
	// Ginger Man protagonist maximum ambulation velocity (12 miles / hour)
	this.currentGingerManProtagonistMaxAmbulationVelocity = 5.36448 /
		Constants.millisecondsPerSecond;

	// Initial vertical velocity applied to the Ginger Man protagonist
	// during a jump.
	this.initialGingerManProtagonistJumpVelocityMetersPerMs = 6.3 /
		Constants.millisecondsPerSecond;

	// Ginger Man protagonist ambulation acceleration, expressed in meters / millisecond²
	this.gingerManProtagonistAmbulationAccelerationMetersPerMsSq = 30.0 /
		(Constants.millisecondsPerSecond * Constants.millisecondsPerSecond);

	// Ginger Man protagonist aerial acceleration adjustment factor (relative
	// to ambulation acceleration)
	this.gingerManProtagonistAerialAccelerationScaleFactor = 0.15;

	// Ginger Man protagonist ambulation deceleration (used when stopping),
	// expressed in meters / millisecond²
	this.gingerManProtagonistAmbulationDecelerationMetersPerMsSq =
		this.gingerManProtagonistAmbulationAccelerationMetersPerMsSq;

	// Acceleration along the X-axis that is being explicitly applied to
	// the Ginger Man protagonist.
	this.currentGingerManProtagonistAmbulationAccelerationAxisX = 0.0;

	// Flag which indicates that a jump was initiated (evaluated
	// only once per flag activation).
	this.gingerManProtagonistJumpInitiated = false;

	// Model direction bias to apply to the model when no acceleration
	// is being applied along the X-axis.
	this.currentGingerManProtagonistStaticModelDirectionBias = 1;

	// Dynamic object deceleration, for dynamic elements that are in
	// contact with a horizontal surface, expressed in
	// meters / millisecond²
	this.dynamicElementSurfaceDecelerationMetersPerMsSq = 15.0;

	// Value that will be considered as zero velocity, for
	// dynamic object surface collisions that are not completely
	// elastic, in meters / millisecond
	this.constDynamicElementZeroVerticalVelocityThreshold = 0.0001;

	// Scaling factor used to appropriately adjust the world scale to the
	// WebGL coordinate system. Each world scale measurement unit is
	// roughly equivalent to 1 meter; the world scale does not change
	// the actual equivalent unit length - it only adjusts the scale
	// used for rendering.
	// 1 meter = x rendering coordinate space units
	this.constWorldScale = 0.10;

	// Divisor which determines how slowly the backdrop
	// scrolls in relation to the foreground.
	this.constBackdropScrollRateDivisor = 4.0;

	// Gravitational acceleration, expressed in meters / millisecond²
	this.constGravitationalAccelerationMetersPerMsSq = 9.8 /
		(Constants.millisecondsPerSecond * Constants.millisecondsPerSecond);

	// Tile dimensions, in world units
	this.constTileWidthWorldUnits = 1.00;
	this.constTileHeightWorldUnits = 1.00;

	this.constGingerManProtagonistBaseScaleMultiplier = 2.9;
	this.constScaleFactorDefaultGingerManProtagonist = this.constGingerManProtagonistBaseScaleMultiplier * this.constWorldScale;

	this.constGingerManProtagonistRenderSpaceOffsetAxisZ = 0.0;//this.constGingerManProtagonistBaseScaleMultiplier * -0.633333333;

	// Keys used to reference level data within the
	// resource key/value store
	this.levelKeyCollection =
	[
		"keyLevel1",
		"keyLevel2",
		"keyLevel3",
		"keyLevel4",
		"keyLevel5",
		"keyLevel6",
		"keyLevel7",
		"keyLevel8",
		"keyLevel9",
		"keyLevel10",
	];

	// Shader source resource key names
	this.keyVertexShaderStandardPosition = "keyVertexShaderStandardPosition";
	this.keyVertexShaderEdgeRotationSkinning = "keyVertexShaderEdgeRotationSkinning";
	this.keyFragmentShaderGingerManGouraud = "keyFragmentShaderGingerManGouraud";
	this.keyFragmentShaderGouraud = "keyFragmentShaderGouraud";
	this.keyFragmentShaderDarkeningGouraud = "keyFragmentShaderDarkeningGouraudTexture";
	this.keyFragmentShaderPointLightGouraud = "keyFragmentShaderGouraud";
	this.keyFragmentShaderStandardTexture = "keyFragmentShaderStandardTexture";
	this.keyFragmentShaderBackdrop = "keyFragmentShaderBackdrop";
	this.keyFragmentShaderLevelRepBackdrop = "keyFragmentShaderLevelRepBackdrop";
	this.keyFragmentShaderGouraudTexture = "keyFragmentShaderGouraudTexture";
	this.keyFragmentShaderBlackFader = "keyFragmentShaderBlackFader";
	this.keyFragmentShaderSpiritMeterTextureClip = "keySpiritMeterTextureClip";
	this.keyFragmentShaderRippleConverge = "keyFragmentShaderRippleConverge";

	// Compiled shader programs
	this.shaderStandardObject = null;
	this.shaderPointLightStandardObject = null;
	this.shaderGouraudTexture = null;
	this.shaderDarkeningGouraudTexture = null;
	this.shaderStandardTexturedObject = null;
	this.shaderStandardOverlayTextureRender = null;
	this.shaderBackdropRender = null;
	this.shaderLevelRepBackdrop = null;
	this.shaderSpiritMeterTextureClip = null;
	this.shaderBlackFader = null;
	this.shaderEdgeRotationSkinning = null;
	this.shaderRippleConverge = null;

	this.keyModelGingerBreadMan = "keyModelGingerBreadMan";
	this.keyModelEnemyGrinch = "keyModelEnemyGrinch";
	this.keyModelEnemyCoronaVirusMonster = "keyModelEnemyCoronaVirusMonster";
	this.keyModelEnemyBallOrnamentMonster = "keyModelEnemyBallOrnamentMonster";
	this.keyModelEnemyEvilChristmasTreeMonster = "keyModelEnemyEvilChristmasTreeMonster";
	this.keyModelEnemyGumDropMonster = "keyModelEnemyGumDropMonster";
	this.keyModelPowerUpSpeed = "keyModelPowerUpSpeed";
	this.keyModelPowerUpJump = "keyModelPowerUpJump";
	this.keyModelPowerUpInvulnerability = "keyModelPowerUpInvulnerability";
	this.keyModelHousePartDoor = "keyModelHousePartDoor";
	this.keyModelHousePartRoofHalf = "keyModelHousePartRoofHalf";
	this.keyModelHousePartShortSide = "keyModelHousePartShortSide";
	this.keyModelHouseShortSideWithDoor = "keyModelHousePartShortSideWithDoor";
	this.keyModelHousePartLongSideWithWindows = "keyModelHousePartLongSideWithWindows";

	this.keyTextureHourglass = "keyTextureHourGlass1";

	this.constModelInitializationScaleFactors = {};
	this.constModelInitializationScaleFactors[this.keyModelGingerBreadMan] =
		this.constScaleFactorDefaultGingerManProtagonist;
	this.constModelInitializationScaleFactors[this.keyModelPowerUpSpeed] 						= 0.22;
	this.constModelInitializationScaleFactors[this.keyModelPowerUpJump]							= 0.22;
	this.constModelInitializationScaleFactors[this.keyModelPowerUpInvulnerability]				= 0.22;
	this.constModelInitializationScaleFactors[this.keyModelHousePartDoor] 						= 0.15;
	this.constModelInitializationScaleFactors[this.keyModelHousePartRoofHalf]					= 0.15;
	this.constModelInitializationScaleFactors[this.keyModelHousePartShortSide]					= 0.15;
	this.constModelInitializationScaleFactors[this.keyModelHouseShortSideWithDoor]				= 0.15;
	this.constModelInitializationScaleFactors[this.keyModelHousePartLongSideWithWindows]		= 0.15;
	this.constModelInitializationScaleFactors[this.keyModelEnemyGrinch]							= 0.15;
	this.constModelInitializationScaleFactors[this.keyModelEnemyBallOrnamentMonster]			= 0.27;
	this.constModelInitializationScaleFactors[this.keyModelEnemyEvilChristmasTreeMonster]		= 0.25;
	this.constModelInitializationScaleFactors[this.keyModelEnemyCoronaVirusMonster]				= 0.17;
	this.constModelInitializationScaleFactors[this.keyModelEnemyGumDropMonster]					= 0.10;

	// Spirit Gauge colors
	this.constSpiritGaugeMaxValueColor = new RgbColor(0.0, 1.0, 0.0, 0.75);
	this.constSpiritGaugeMinValueColor = new RgbColor(0.8, 0.0, 0.0, 0.75);
	this.constSpiritGaugeLeadingEdgeColor = new RgbColor(1.0, 1.0, 1.0, 1.0);
	this.constSpiritGaugeLeadingEdgeFraction = 0.92;
	this.constSpiritGaugeOutlineColor = new RgbColor(1.0, 1.0, 1.0, 0.9);	
	
	this.constSpiritGaugeWidth = 650;

	// "Reference" model dimensions for loaded models - represents
	// the dimensions of models before they were loaded (before
	// any applied transformations) (ModelDimensions collection)
	this.modelRefDimensionKeyValStore = {};	

	// Key/value storage for general model
	// orientation/"pose" matrices, with the
	// model centered at the origin (or, the primary
	// model being centered at the origin, in instances
	// where multiple, discrete models comprise a larger
	// model; world/render-space translations are
	// computed elsewhere) (MathExt.Matrix collection)
	this.modelMatrixKeyValStore = {};

	// Collection of enemy objects which exist within the
	// active level (EnemyInstanceData type)
	this.enemyInstanceDataCollection = []

	// Collection of goal items to be located within
	// the active level (DynamicItemInstanceData type)
	this.goalItemInstanceDataCollection = [];

	// Collection of goal items to be located within
	// the active level (DynamicItemInstanceData type)
	this.powerUpItemInstanceDataCollection = [];
	
	// Model WebGL buffers (WebGL vertex buffer data) -
	// All models (including those for the Ginger Man
	// protagonist) have an associated buffer, which
	// is required for rendering.
	this.webGlBufferDataKeyValStore = {};	

	this.backdropLevelVertexBufferKey = "backdrop";

	// WebGL buffer key used to retrieve the backdrop
	// vertex buffer used to render the backdrop
	// dynamic texture
	this.structuredBackdropLevelVertexBufferKey = "backdropLevel";

	var constStartingLevelIndex = 0;

	// Key used to look-up the backdrop texture from the resources
	// key-value store.
	this.currentBackdropTextureKey = null;

	// GingerMan protagonist world space position, expressed
	// in meters
	this.currentWorldSpacePositionInLevel = new Point3d(0.0, 0.0, 0.0);
	
	// GingerMan protagonist velocity, expressed in meters/millisecond
	this.currentGingerManProtagonistVelocity = new Vector3d(0.0, 0.0, 0.0);

	this.constLevelSymbolTypeGoalSpecifier = "ElementType_Goal";
	this.constLevelSymbolTypePowerUpSpecifier = "ElementType_PowerUp";
	this.constLevelSymbolTypeEnemySpecifier = "ElementType_Enemy";

	// Movement pattern characterized by constant velocity (including
	// zero) along both axis
	this.constLevelSymbolTypeMovementPatternLinear = "MovementType_Linear";
	// Movement pattern that is characterized by a single-instant
	// velocity being applied; the target object is subject to
	// gravitational acceleration, resulting in a parabolic descent
	this.constLevelSymbolTypeMovementPatternPeriodicJump = "MovementType_PeriodicJump";
	// Movement pattern that is characterized by the target object
	// descending as a result of the influence of gravity, but
	// bouncing upon contact with a horizontal surface (perfect
	// elasticity)
	this.constLevelSymbolTypeMovementPatternBounce = "MovementType_Bounce";
	
	// Parsed movement type specifier value that corresponds to
	// "MovementType_Linear"
	this.constMovementPatternSpecifierLinear = 0;
	// Parsed movement type specifier value that corresponds to
	// "MovementType_PeriodicJump"
	this.constMovementPatternSpecifierPeriodicJump = 1;
	// Parsed movement type specifier value that corresponds to
	// "MovementType_Bounce"
	this.constMovementPatternBounce = 2;

	// Rotation rate of power-up items (animation) - degrees /
	// millisecond
	this.powerUpItemRotationRate = (Math.PI / 0.8) / Constants.millisecondsPerSecond;

	// Rotation rate of the goal items (animation) - degrees /
	// millisecond
	this.goalItemRotationRate = (Math.PI / 2.0) / Constants.millisecondsPerSecond;

	// Timer identifier for the timer which governs the expiration of the
	// current power-up
	this.constTimerIdPowerUp = "TimerId_PowerUp";

	// Speed multiplier power-up (value - maximum speed unitless multiplier)
	this.constPowerUpNameSpeedMultiplier = "speedMultiplier";

	// Jump multiplier power-up (value - initial jump velocity unitless multiplier)
	this.constPowerUpNameJumpMultiplier = "jumpMultiplier";

	// Invulnerability power-up (value - boolean)
	this.constPowerUpNameInvulnerability = "invunerability";

	this.constEnemyDataKeyBaseVelocityX = "keyEnemyDataBaseVelocityX";
	
	this.constEnemyDataKeyBaseVelocityY = "keyEnemyDataBaseVelocityY";

	this.currentSpeedAttrEnhancementMultiplier = null;

	this.currentJumpAttrEnhancmentMultiplier = null;

	this.currentInvulnerabilityAttrEnhancementActive = null;

	this.periodicJumpDefaultRestitutionCoefficient = 0.2;

	this.constTimerIdDamageAnimation = "TimerId_DamageAnimation";
	this.constDamageAnimationOscFrequencyX = 2;
	this.constDamageSkewCoefficientMaxMagnitude = 0.06;
	this.constDamageAnimationDurationMs = 3000;
	
	this.constTimerIdGameOverAnimation = "TimerId_GameOverAnimation";
	this.constGameOverAnimationDurationMs = 1500;
	this.constGameOverFlatteningCoefficient = 10.0;

	// Miscellaneous timer management
	this.timers = new ExternalSourceTimerCollection();

	this.constFullScreenOverlayRenderSpaceHeight = 2.0;

	// Background color for the "game over" overlay
	this.constGameEndOverlayBackgroundColor = new RgbColor(0.0, 0.0, 0.0, 0.4);

	// Color used to clear the WebGL canvas
	this.constCanvasClearColor = new RgbColor(0.0, 0.0, 0.0, 0.0);

	this.progressOverlayWebGlData = null;

	// Default background color for text overlay
	this.defaultTextAreaBackgroundColor = new RgbColor(
		Constants.defaultTextBackgroundUnitIntensity,
		Constants.defaultTextBackgroundUnitIntensity,
		Constants.defaultTextBackgroundUnitIntensity,		
		Constants.defaultTextBackgroundUnitAlpha);

	this.fadeTransitionController = new FadeTransitionController();	
	this.fadeOverlayRenderer = new FadeOverlayRenderer(this.fadeTransitionController);
	
	this.constGaugeOverlayRenderSpaceTopOffsetY = 0.05;
	this.constGaugeOverlayRenderSpaceHeight = 0.10;
	this.constSpiritMeterAxisSpanX = 1.55;

	this.constFullScreenOverlayAxisSpanX = 2.0;
	this.constFullScreenOverlayAxisSpanY = 2.0;

	this.constSpiritMeterOverlayRenderSpaceCenterX = 0.16
	this.constSpiritMeterLabelOverlayTopOffsetY = this.constGaugeOverlayRenderSpaceTopOffsetY;
	this.constSpiritMeterLabelOverlayCanvasHeight = 48;
	this.constSpiritMeterLabelOverlayRenderSpaceHeight = 0.10;

	this.constGoalStatusOverlayTopY = 1.0 - (this.constGaugeOverlayRenderSpaceTopOffsetY +
		this.constGaugeOverlayRenderSpaceHeight);
	this.constGoalStatusOverlayCanvasHeight = 48;
	this.constGoalStatusOverlayRenderSpaceHeight = 0.10;
	this.constRenderSpaceLabelMarginX = 0.03;

	this.constOverlayScrimRenderSpaceHeight = this.constSpiritMeterLabelOverlayRenderSpaceHeight +
		this.constGoalStatusOverlayRenderSpaceHeight + this.constGaugeOverlayRenderSpaceTopOffsetY;

	this.spiritMeterRenderer = new SpiritMeterRenderer(this.constSpiritGaugeWidth, Constants.overlayTextureHeight,
		this.constCanvasClearColor, this.constSpiritGaugeMinValueColor, this.constSpiritGaugeMaxValueColor,
		this.constSpiritGaugeOutlineColor)
	this.spiritMeterRenderer.initialize(globalResources.getMainCanvasContext(), this.constSpiritMeterAxisSpanX,
		this.constGaugeOverlayRenderSpaceHeight, this.constSpiritMeterOverlayRenderSpaceCenterX,
		1.0 - this.constGaugeOverlayRenderSpaceTopOffsetY - (this.constGaugeOverlayRenderSpaceHeight / 2.0));

	this.gameEndOverlayRenderer = new CanvasTextureOverlayRenderer(this.gameEndOverlayContentGenerator());
	this.gameEndOverlayRenderer.initialize(globalResources.getMainCanvasContext(),
		Constants.defaultCanvasWidth, Constants.defaultCanvasHeight,
		this.constFullScreenOverlayAxisSpanX, this.constFullScreenOverlayAxisSpanY, 0.0, 0.0);

	this.gameCompletionOverlayRenderer = new CanvasTextureOverlayRenderer(this.gameCompletionOverlayContentGenerator());
	this.gameCompletionOverlayRenderer.initialize(globalResources.getMainCanvasContext(),
		Constants.defaultCanvasWidth, Constants.defaultCanvasHeight,
		this.constFullScreenOverlayAxisSpanX, this.constFullScreenOverlayAxisSpanY, 0.0, 0.0);

	// Canvas used to render the goal status label
	this.goalStatusTextCanvasBuffer = new StaticTextLineCanvasBuffer(Constants.labelFontSizePx,
		Constants.labelFont, Constants.labelFontStyle);

	this.goalStatusOverlayRenderer = new CanvasTextureOverlayRenderer(this.goalStatusContentGenerator());
	this.goalStatusOverlayRenderer.initialize(globalResources.getMainCanvasContext(),
		Constants.defaultCanvasWidth, this.constGoalStatusOverlayCanvasHeight,
		this.constFullScreenOverlayAxisSpanX, this.constGoalStatusOverlayRenderSpaceHeight, 0.0 + this.constRenderSpaceLabelMarginX,
		this.constGoalStatusOverlayTopY - (this.constGoalStatusOverlayRenderSpaceHeight / 2.0));

	this.spiritMeterLabelTextCanvasBuffer = new StaticTextLineCanvasBuffer(Constants.labelFontSizePx,
		Constants.labelFont, Constants.labelFontStyle);

	this.spiritMeterLabelTextRenderer = new CanvasTextureOverlayRenderer(this.spiritMeterLabelContentGenerator());
	this.spiritMeterLabelTextRenderer.initialize(globalResources.getMainCanvasContext(),
		Constants.defaultCanvasWidth, this.constSpiritMeterLabelOverlayCanvasHeight,
		this.constFullScreenOverlayAxisSpanX, this.constSpiritMeterLabelOverlayRenderSpaceHeight, 0.0 + this.constRenderSpaceLabelMarginX,
		1.0 - this.constSpiritMeterLabelOverlayTopOffsetY - (this.constSpiritMeterLabelOverlayRenderSpaceHeight / 2.0));

	// Canvas used to render the spirit meter label
	this.spiritLabelCanvasBuffer = new StaticTextLineCanvasBuffer(Constants.labelFontSizePx,
		Constants.labelFont, Constants.labelFontStyle);
	this.spiritLabelCanvasBuffer.updateStaticTextString(Constants.stringVitalityLabel);

	this.gameStatusOverlayScrimRenderer = new CanvasTextureOverlayRenderer(this.statusScrimContentGenerator());
	this.gameStatusOverlayScrimRenderer.initialize(globalResources.getMainCanvasContext(),
		Constants.defaultCanvasWidth, this.constSpiritMeterLabelOverlayCanvasHeight,
		this.constFullScreenOverlayAxisSpanX, this.constOverlayScrimRenderSpaceHeight, 0.0,
		(1.0 - this.constOverlayScrimRenderSpaceHeight / 2.0));

	// Represents the spatial data / element attribute specification
	// of the current level.
	this.currentLevelRepresentation = null;

	// Represents the spatial data for the backdrop
	// level construction associated with the current level
	this.currentBackdropLevelRepresentation = null;

	// Manages viewport coordinates required to display the
	// proper portion of the level.
	this.levelScrollManager = null;

	// Minimum / maximum absolute Ginger Man protagonist "health" values
	this.constGingerManProtagonistMinHealth = 0.0;
	this.constGingerManProtagonistMaxHealth = 150.0;
	
	this.constGeneralInvulnerabilityDurationMs = 3000.0;

	// Rate at which the Ginger Man protagonist health decreases
	// per millisecond
	this.constGingerManProtagonistHealthDecreaseRatePerMs = 0.80 / Constants.millisecondsPerSecond;

	// Number of total goal items
	// @see MainGingerManGameplayScene.goalItemInstanceDataCollection
	this.totalGoalItemCount = 0;
	
	// Number of discovered goal items
	this.discoveredGoalItemCount = 0;

	// General game state
	this.gameState = new GameState();
	this.gameState.setMinProtagonistFortitudeValue(this.constGingerManProtagonistMinHealth);
	this.gameState.setMaxProtagonistFortitudeValue(this.constGingerManProtagonistMaxHealth);
	this.gameState.setLevelCount(this.levelKeyCollection.length);

	this.gameRenderStateUtility = new GameRenderStateUtility();	

	// Texture to which the backdrop will be rendered
	this.backdropDynamicTexture = null;

	this.backdropDynamicTextureFrameBuffer = null;

	this.backdropDepthBuffer = null;

	// Caches uniform locations for shader uniform look-ups.
	// The cache is keyed by a caller-provided key (should be
	// unique for each used shader. The object associated
	// with each key returns a key/value store, keyed by the
	// uniform name.
	this.uniformLocationCache = {};

	var webGlCanvasContext = globalResources.getMainCanvasContext();
	webGlCanvasContext.clearColor(this.constCanvasClearColor.getRedValue(), this.constCanvasClearColor.getGreenValue(),
		this.constCanvasClearColor.getBlueValue(), this.constCanvasClearColor.getAlphaValue())	

	// Enable alpha blending.
	webGlCanvasContext.enable(webGlCanvasContext.BLEND);
	webGlCanvasContext.blendEquation(webGlCanvasContext.FUNC_ADD);
	webGlCanvasContext.blendFunc(webGlCanvasContext.ONE, webGlCanvasContext.ONE_MINUS_SRC_ALPHA);
	
	webGlCanvasContext.enable(webGlCanvasContext.CULL_FACE);
	webGlCanvasContext.cullFace(webGlCanvasContext.BACK);

	this.buildShaderPrograms(webGlCanvasContext);

	this.webGlBufferDataLevelTileCube = null;

	var sceneInstance = this;
	function finalizeInitialization() {
		// Prepare the gameplay level for use.
		sceneInstance.setupNewLevelState(constStartingLevelIndex);
		sceneInstance.setupInputEventHandler();
		
		if (Utility.validateVar(completionFunction)) {
			completionFunction();
		}
	}

	this.generateDynamicElementPredeterminedMatrices();
	this.createStructuredBackdropDynamicTexture(webGlCanvasContext);
	this.createStructuredBackdropDynamicTextureFrameBuffer(webGlCanvasContext);
	this.prepareGeometricRenderData(finalizeInitialization);
}

/**
 * Compiles all shader programs that are required for
 *  rendering of the gameplay scene
 * @param canvasContext {WebGLRenderingContext2D} Context required to
 *                      compile the shader programs
 */
MainGingerManGameplayScene.prototype.buildShaderPrograms = function (canvasContext) {
	this.shaderStandardObject = this.buildShaderProgramWithResourceKeys(canvasContext,
		this.keyVertexShaderStandardPosition, this.keyFragmentShaderPointLightGouraud);
	this.shaderPointLightStandardObject = this.buildShaderProgramWithResourceKeys(canvasContext,
		this.keyVertexShaderStandardPosition, this.keyFragmentShaderPointLightGouraud);
	this.shaderGouraudTexture = this.buildShaderProgramWithResourceKeys(canvasContext,
		this.keyVertexShaderStandardPosition, this.keyFragmentShaderGouraudTexture);
	this.shaderDarkeningGouraudTexture =  this.buildShaderProgramWithResourceKeys(canvasContext,
		this.keyVertexShaderStandardPosition, this.keyFragmentShaderDarkeningGouraud);
	this.shaderStandardTexturedObject = this.buildShaderProgramWithResourceKeys(canvasContext,
		this.keyVertexShaderStandardPosition, this.keyFragmentShaderStandardTexture);
	this.shaderStandardOverlayTextureRender = this.buildShaderProgramWithResourceKeys(canvasContext,
		this.keyVertexShaderStandardPosition, this.keyFragmentShaderStandardTexture);
	this.shaderBackdropRender = this.buildShaderProgramWithResourceKeys(canvasContext,
		this.keyVertexShaderStandardPosition, this.keyFragmentShaderBackdrop);
	this.shaderLevelRepBackdropRender = this.buildShaderProgramWithResourceKeys(canvasContext,
		this.keyVertexShaderStandardPosition, this.keyFragmentShaderLevelRepBackdrop);
	this.shaderSpiritMeterTextureClip = this.buildShaderProgramWithResourceKeys(canvasContext,
		this.keyVertexShaderStandardPosition, this.keyFragmentShaderSpiritMeterTextureClip);
	this.shaderBlackFader = this.buildShaderProgramWithResourceKeys(canvasContext,
		this.keyVertexShaderStandardPosition, this.keyFragmentShaderBlackFader);
	this.shaderEdgeRotationSkinning = this.buildShaderProgramWithResourceKeys(canvasContext,
		this.keyVertexShaderEdgeRotationSkinning, this.keyFragmentShaderGingerManGouraud);
	this.shaderRippleConverge = this.buildShaderProgramWithResourceKeys(canvasContext,
		this.keyVertexShaderStandardPosition, this.keyFragmentShaderRippleConverge);
}

/**
 * Compiles a shader program, using the provided resource keys that
 *  correspond to shader source
 * @param canvasContext {WebGLRenderingContext2D} Context required to
 *                                                compile the shader program
 * @param vertexShaderKey {String} Key used to access the vertex shader
 *                                 source resource
 * @param fragmentShaderKey {String} Key used to access the fragment
 *                                   shader source resource
 *
 * @return {WebGLProgram} A WebGL shader program upon success, null otherwise
 */
MainGingerManGameplayScene.prototype.buildShaderProgramWithResourceKeys = function(canvasContext, vertexShaderKey, fragmentShaderKey) {
	var shaderProgram = null;

	if (Utility.validateVar(vertexShaderKey) && Utility.validateVar(fragmentShaderKey)) {
		var vertexShader = globalResources.getLoadedResourceDataByKey(vertexShaderKey);
		var fragmentShader = globalResources.getLoadedResourceDataByKey(fragmentShaderKey);

		shaderProgram = WebGlUtility.createShaderProgram(canvasContext, vertexShader.resourceDataStore, fragmentShader.resourceDataStore);
	}

	return shaderProgram;
}

/**
 * Returns the expected attribute location specifiers (as required for use with
 *  WebGLRenderingContext.getAttribLocation()) used with all employed shaders
 *
 * @param useTextures {Boolean} Indicates whether or not the associated shader
 *                              is expected to use textures
 *
 * @return {WebGlUtility.AttributeLocationData()} A collection of expected attribute
 *                                                location specifiers
 */
MainGingerManGameplayScene.prototype.getStandardShaderWebGlAttributeLocations = function(useTextures) {
	var attributeLocationData = new WebGlUtility.AttributeLocationData();
	attributeLocationData.vertexPositionAttributeLocation = "aVertexPosition";
	attributeLocationData.vertexColorAttributeLocation = "aVertexColor";
	attributeLocationData.vertexNormalAttributeLocation = "aVertexNormal";
	attributeLocationData.ambientLightVectorAttributeLocation = "uniform_ambientLightVector";
	
	if (Utility.validateVar(useTextures) && useTextures) {
		attributeLocationData.textureCoordinateAttributeLocation = "aTextureCoord";
	}
	else {
		attributeLocationData.textureCoordinateAttributeLocation = null;		
	}
	
	attributeLocationData.transformationMatrixAttributeLocation = "uniform_transformationMatrix";
	attributeLocationData.projectionMatrixAttributeLocation = "uniform_projectionMatrix";
	
	return attributeLocationData;
}

/**
 * Returns a collection of constants that represent default values
 *  (sizes, etc.) pertaining to the storage of WebGL data, or general
 *  operational values
 *
 * @return {WebGlUtility.AttributeData()} A collection of constants pertaining to the
 *                                        storage of WebGL data/rendering behavior
 */
MainGingerManGameplayScene.prototype.getDefaultWebGlAttributeData = function() {
	var attributeData = new WebGlUtility.AttributeData();
	
	attributeData.vertexDataSize = this.constVertexSize;
	attributeData.vertexColorSize = this.constVertexColorSize;
	attributeData.vectorSize = this.constVectorSize;
	attributeData.ambientLightVector = this.constAmbientLightVector;
	attributeData.textureCoordinateSize = this.constTextureCoordinateSize;

	return attributeData;
}

/**
 * Prepares all procedural and pre-generated geometry data for
 *  use
 *
 * completionFunction {function} Function invoked upon the completion of model data
 *                               preparation
 */
MainGingerManGameplayScene.prototype.prepareGeometricRenderData = function(completionFunction) {
	this.prepareRenderDataForFullScreenOverlay();
	this.prepareRenderDataForProgressOverlay();
	this.prepareGeneratedGeometryRenderData();
	this.prepareModelRenderData(completionFunction);	
}

/**
 * Creates the texture that will be used to render the
 *  level constructs that comprise the near background
 *  component within the gameplay scene
 *
  @param webGlCanvasContext {WebGLRenderingContext2D} Context onto which
 *                          the scene data will be drawn
 */
MainGingerManGameplayScene.prototype.createStructuredBackdropDynamicTexture = function(webGlCanvasContext) {
	// Create the texture, and define the texture format.
	this.backdropDynamicTexture = webGlCanvasContext.createTexture();	
	webGlCanvasContext.bindTexture(webGlCanvasContext.TEXTURE_2D, this.backdropDynamicTexture);
	webGlCanvasContext.texImage2D(webGlCanvasContext.TEXTURE_2D, 0,
		webGlCanvasContext.RGBA, Constants.defaultCanvasWidth, Constants.defaultCanvasHeight,
		0, webGlCanvasContext.RGBA, webGlCanvasContext.UNSIGNED_BYTE, null);

	// The texture will be magnified using bilinear filtering...
	webGlCanvasContext.texParameteri(webGlCanvasContext.TEXTURE_2D,
		webGlCanvasContext.TEXTURE_MAG_FILTER, webGlCanvasContext.LINEAR);
	webGlCanvasContext.texParameteri(webGlCanvasContext.TEXTURE_2D,
		webGlCanvasContext.TEXTURE_MIN_FILTER, webGlCanvasContext.LINEAR);
	webGlCanvasContext.texParameteri(webGlCanvasContext.TEXTURE_2D,
		webGlCanvasContext.TEXTURE_WRAP_S, webGlCanvasContext.CLAMP_TO_EDGE);
	webGlCanvasContext.texParameteri(webGlCanvasContext.TEXTURE_2D,
		webGlCanvasContext.TEXTURE_WRAP_T, webGlCanvasContext.CLAMP_TO_EDGE);

	webGlCanvasContext.bindTexture(webGlCanvasContext.TEXTURE_2D, null);
}

/**
 * Creates the framebuffer to which the level
 *  constructs comprising the near background
 *  component of the gameplay scene will be
 *  rendered
 *
 * @param webGlCanvasContext {WebGLRenderingContext2D} Context onto which
 *                           the scene data will be drawn
 */
MainGingerManGameplayScene.prototype.createStructuredBackdropDynamicTextureFrameBuffer = function(webGlCanvasContext) {
	this.backdropDynamicTextureFrameBuffer = webGlCanvasContext.createFramebuffer();
	this.backdropDepthBuffer = webGlCanvasContext.createRenderbuffer();

	webGlCanvasContext.bindFramebuffer(webGlCanvasContext.FRAMEBUFFER,
		this.backdropDynamicTextureFrameBuffer);

	webGlCanvasContext.bindRenderbuffer(webGlCanvasContext.RENDERBUFFER, this.backdropDepthBuffer);
	
	webGlCanvasContext.renderbufferStorage(webGlCanvasContext.RENDERBUFFER,
		webGlCanvasContext.DEPTH_COMPONENT16, Constants.defaultCanvasWidth, Constants.defaultCanvasHeight);
	webGlCanvasContext.framebufferRenderbuffer(webGlCanvasContext.FRAMEBUFFER, webGlCanvasContext.DEPTH_ATTACHMENT,
		webGlCanvasContext.RENDERBUFFER, this.backdropDepthBuffer);
}

/**
 * Sets the texture that is associated with the a WebGL framebuffer
 * @param webGlCanvasContext {WebGLRenderingContext2D} Context onto which
 *                           the scene data will be drawn
 * @param frameBuffer {WebGLFramebuffer} Framebuffer with which the texture
 *                    will be associated (can be null to specify the default
 *                    framebuffer
 * @param width {number} Framebuffer viewport width
 *                       (can be null/omitted if frameBuffer is null)
 * @param height {number} Framebuffer viewport height
 *                        (can be null/omitted if frameBuffer is null
 */
MainGingerManGameplayScene.prototype.setTextureRenderTarget = function(webGlCanvasContext, frameBuffer, texture, width, height) {
	webGlCanvasContext.bindFramebuffer(webGlCanvasContext.FRAMEBUFFER, frameBuffer);

	if (texture != null) {
		webGlCanvasContext.framebufferTexture2D(webGlCanvasContext.FRAMEBUFFER,
			webGlCanvasContext.COLOR_ATTACHMENT0, webGlCanvasContext.TEXTURE_2D,
			texture, 0);
	}

	var resolvedWidth = (frameBuffer != null)
		? width
		: webGlCanvasContext.canvas.width;
	var resolvedHeight = (frameBuffer != null)
		? height
		: webGlCanvasContext.canvas.height;
	webGlCanvasContext.viewport(0, 0, resolvedWidth, resolvedHeight);	
}

/**
 * Generates data required to render representations of
 *  procedurally-generated geometry data (e.g., base terrain
 *  geometry)
 */
MainGingerManGameplayScene.prototype.prepareGeneratedGeometryRenderData = function() {
	this.webGlBufferDataLevelTileCube = WebGlUtility.createWebGlBufferDataFromAggregateVertexData(
		globalResources.getMainCanvasContext(), this.levelTileCubeAggregateVertexData(),
		this.constVertexSize);

	this.webGlBufferDataKeyValStore[this.backdropLevelVertexBufferKey] =
		WebGlUtility.createWebGlBufferDataFromAggregateVertexData(
			globalResources.getMainCanvasContext(), this.backdropLevelAggregateVertexData(),
			this.constVertexSize);	

	this.webGlBufferDataKeyValStore[this.structuredBackdropLevelVertexBufferKey] =
		WebGlUtility.createWebGlBufferDataFromAggregateVertexData(
			globalResources.getMainCanvasContext(), this.structuredBackdropLevelAggregateVertexData(),
			this.constVertexSize);
}

/**
 * Generates data suitable for rendering a texture onto
 *  geometry that represents an overlay.
 * 
 * @param width {number} Length of the quad along the X-axis
 * @param height {number} Length of the quad along the Y-axis
 * @param centerX {number} Center coordinate of the quad along the X-axis
 * @param centerY {number} Center coordinate of the quad along the Y-axis 
 */
MainGingerManGameplayScene.prototype.prepareRenderDataForGeneralOverlay = function (width, height, centerX, centerY) {	
	var overlayQuadVertices = WebGlUtility.quadCoordArray(width, height, centerX, centerY, -1.0)
	
	var webGlBufferData = new WebGlUtility.WebGlBufferData();
	
	webGlBufferData.objectWebGlVertexBuffer = WebGlUtility.createWebGlBufferFromData(globalResources.getMainCanvasContext(),
		overlayQuadVertices);
	webGlBufferData.objectWebGlTexCoordBuffer = WebGlUtility.createWebGlBufferFromData(globalResources.getMainCanvasContext(),
		WebGlUtility.zPlaneQuadTextureCoords());

	webGlBufferData.vertexCount = overlayQuadVertices.length / this.constVertexSize;	
	
	return webGlBufferData;	
}


/**
 * Creates WebGL buffers for the full-screen overlay quad, ensuring that data
 *  can be immediately rendered
 */
MainGingerManGameplayScene.prototype.prepareRenderDataForFullScreenOverlay = function() {	
	var constAxisSpanX = 2.0;

	this.fullScreenOverlayWebGlData = this.prepareRenderDataForGeneralOverlay(
		constAxisSpanX, this.constFullScreenOverlayRenderSpaceHeight, 0.0, 0.0);
}

/**
 * Creates geometry for a Z-plane aligned quad
 *
 * @param xAxisSpan {number} Length of the quad along the X-axis
 * @param yAxisSpan {number} Length of the quad along the Y-axis
 * @param centerX {number} Center of the quad along the X-axis
 * @param centerY {number} Center of the quad along the Y-axis
 * @param zCoord {number} Z-plane coordinate in which the quad lies
 * @param invertVertically {boolean} When set to true, coordinates values
 *                                   will decrease top to bottom
 *
 * @return {Array} Array of Triangle objects which comprise the Z-plane
 *                 aligned quad
 */
MainGingerManGameplayScene.prototype.zPlaneQuadTriangles = function (xAxisSpan, yAxisSpan, centerX, centerY, zCoord, invertVertically) {
	var inversionActive =
		(Utility.validateVar(invertVertically) && invertVertically)
			? true
			: false;

	var topCoord = inversionActive ? 1.0 : 0.0;
	var bottomCoord = inversionActive ? 0.0 : 1.0;

	var normalVector = new Vector3d(0.0, 0.0, -1.0);
	
	var firstTriangleVertexA = new Vertex3d(-xAxisSpan / 2.0 + centerX,		yAxisSpan / 2.0 + centerY,		zCoord);
	var firstTriangleVertexB = new Vertex3d(-xAxisSpan / 2.0 + centerX, 	-yAxisSpan / 2.0 + centerY,		zCoord);
	var firstTriangleVertexC = new Vertex3d(xAxisSpan / 2.0 + centerX, 		-yAxisSpan / 2.0 + centerY,		zCoord);
	
	var secondTriangleVertexA = new Vertex3d(xAxisSpan / 2.0 + centerX, 	-yAxisSpan / 2.0 + centerY,		zCoord);
	var secondTriangleVertexB = new Vertex3d(xAxisSpan / 2.0 + centerX, 	yAxisSpan / 2.0 + centerY, 		zCoord);
	var secondTriangleVertexC = new Vertex3d(-xAxisSpan / 2.0 + centerX, 	yAxisSpan / 2.0 + centerY,		zCoord);

	firstTriangleVertexA.setSurfaceMappingCoords(0.0, topCoord);
	firstTriangleVertexB.setSurfaceMappingCoords(0.0, bottomCoord);
	firstTriangleVertexC.setSurfaceMappingCoords(1.0, bottomCoord);
	
	secondTriangleVertexA.setSurfaceMappingCoords(1.0, bottomCoord);
	secondTriangleVertexB.setSurfaceMappingCoords(1.0, topCoord);
	secondTriangleVertexC.setSurfaceMappingCoords(0.0, topCoord);
	
	var vertices = [
		firstTriangleVertexA,
		firstTriangleVertexB,
		firstTriangleVertexC,
		secondTriangleVertexA,
		secondTriangleVertexB,
		secondTriangleVertexC,
	];
	
	vertices.forEach(function(vertex) {
		vertex.setNormalVector(normalVector);
	});
	
	return [ new Triangle(firstTriangleVertexA, firstTriangleVertexB, firstTriangleVertexC),
		new Triangle(secondTriangleVertexA, secondTriangleVertexB, secondTriangleVertexC) ];
}

/**
 * Retrieves WebGL vertex data required to render an object the
 *  near background component within the gameplay scene
 *
 * @return {AggregateWebGlVertexData} Object which contains WebGL vertex
 *                                    data that can be directly buffered by
 *                                    WebGL
 */
MainGingerManGameplayScene.prototype.backdropLevelAggregateVertexData = function() {
	return this.structuredBackdropLevelAggregateVertexData();
}

/**
 * Generates vertex data used to render the backdrop level
 *
 * @return {AggregateWebGlVertexData} Object which contains WebGL vertex
 *                                    data that can be directly buffered by
 *                                    WebGL
 */
MainGingerManGameplayScene.prototype.structuredBackdropLevelAggregateVertexData = function() {
	var backdropLevelCoordSpan = 2.0;
	
	var quadTriangles = this.zPlaneQuadTriangles(backdropLevelCoordSpan, backdropLevelCoordSpan, 0.0, 0.0, 1.0, true)
	var backdropLevelWebGlVertexData = new WebGlUtility.generateAggregateVertexDataFromTriangleList(
		quadTriangles);
	
	return backdropLevelWebGlVertexData;
}

/*
 * Renders a visual representation of a provided operation progress
 *  fraction value
 *
 * @param progressFraction {Number} Number representing an
 *                                  approximate progress fraction (0.0 - 1.0,
 *                                  inclusive)
 *
 * @see MainGingerManGameplayScene.prepareModelRenderData
 */
MainGingerManGameplayScene.prototype.renderModelPreparationProgressIndicatorImmediate = function (progressFraction) {
	if (Utility.validateVar(progressFraction)) {		
		var overlayTexture = globalResources.textureKeyValueStore[this.keyTextureHourglass];
		var textureSize = globalResources.textureSizeKeyValueStore[this.keyTextureHourglass];
		
		// The "horizontal blur convergence" applies a blur, evaluated
		// horitonally for each texel, that decreases in span s the progress
		// fraction approaches one (at which point the source image/
		// texture will appear in its unaltered form).
		var colorSplitProgressRenderWebGlData = WebGlUtility.objectRenderWebGlDataFromWebGlBufferData(	
			this.progressOverlayWebGlData, this.shaderRippleConverge);
		
		var canvasContext = globalResources.getMainCanvasContext();
		this.setTextureRenderTarget(canvasContext, null, null, null, null);
		var transformationMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
			this.constTransformationMatrixColumnCount);
		transformationMatrix.setToIdentity();
		var webGlAttributeLocationData = this.getStandardShaderWebGlAttributeLocations(true);
		var webGlAttributeData = this.getDefaultWebGlAttributeData();	

		function horizontalBlurConvergeUniformSetup(shaderProgram) {			
			var rippleFactorUniform = canvasContext.getUniformLocation(shaderProgram, "uniform_rippleFactor");
			canvasContext.uniform1f(rippleFactorUniform, 1.0 - progressFraction);

			//var imageWidthUniformLocation = canvasContext.getUniformLocation(shaderProgram, "imageWidth");
			//canvasContext.uniform1f(imageWidthUniformLocation, textureSize[0]);
		}
		
		canvasContext.colorMask(true, true, true, true);
		canvasContext.clear(canvasContext.COLOR_BUFFER_BIT);
		WebGlUtility.renderGeometry(colorSplitProgressRenderWebGlData, transformationMatrix, transformationMatrix,
			overlayTexture, canvasContext, webGlAttributeLocationData, webGlAttributeData, horizontalBlurConvergeUniformSetup);
		canvasContext.finish();
	}
}

/**
 * Creates WebGL buffers for the full-screen overlay quad, ensuring that data
 *  can be immediately rendered
 */
MainGingerManGameplayScene.prototype.prepareRenderDataForProgressOverlay = function() {	
	this.progressOverlayWebGlData = this.prepareRenderDataForGeneralOverlay(1.0, 2.0, 0.0, 0.0);
}

/**
 * Determines the dimensions of a render-space bounding cube that is
 *  derived from a provided set of vertices.
 *
 * @param modelVertexData {ObjFormatBufferParserUtility.ModelVertexDataContainer} Object which encapsulates a
 *                                                                                collection of vertices
 */
MainGingerManGameplayScene.prototype.modelDimensionsFromModelVertexData = function (modelVertexData) {
	var modelDimensions = new ModelDimensions();
		
	if (Utility.validateVarAgainstType(modelVertexData, ObjFormatBufferParserUtility.ModelVertexDataContainer)) {	
		modelDimensions.dimensionX = modelVertexData.modelDimensionX;
		modelDimensions.dimensionY = modelVertexData.modelDimensionY;
		modelDimensions.dimensionZ = modelVertexData.modelDimensionZ;
	}
	
	return modelDimensions;
}

/**
 * Generates vertex buffer data employed to render the geometry
 *  for a single level tile
 *
 * @return {AggregateWebGlVertexData} Object which contains WebGL vertex
 *                                    data that can be directly buffered by
 *                                    WebGL
 */
MainGingerManGameplayScene.prototype.levelTileCubeAggregateVertexData = function() {
	var tileWidth = WorldRepresentationUtility.worldSpaceLengthToRenderSpaceLength(
		this.constTileWidthWorldUnits, this.constWorldScale);
	var tileHeight = WorldRepresentationUtility.worldSpaceLengthToRenderSpaceLength(
		this.constTileHeightWorldUnits, this.constWorldScale);
	var tileDepth = WorldRepresentationUtility.worldSpaceLengthToRenderSpaceLength(
		this.constTileHeightWorldUnits, this.constWorldScale);

	var cubeGenerator =
		new TessellatedBoxGenerator(tileWidth, tileHeight, tileDepth, new Point3d(0.0, 0.0, 0.0));

	cubeGenerator.generateGeometry();
	var wallCubeVertexData = WebGlUtility.generateAggregateVertexDataFromTriangleList(cubeGenerator.getTriangleList());

	return wallCubeVertexData;
}

/**
 * Decodes render model data, encoded in OBJ model format, and applies an
 *  required pre-processing in preparation for use
 *
 * @param modelKey {String} Key used to access the model data which exists
 *                          in the resource key-value store.
 *
 */
MainGingerManGameplayScene.prototype.prepareModelRenderDataFromKeyedObjBuffer = function (modelKey) {
	if (Utility.validateVar(modelKey)) {
		vertexDefProcessorBoundsNormalizer = new ObjFormatBufferParserUtility.ObjVertexDefProcessorObjectBoundsNormalizer()
		vertexDefProcessorBoundsNormalizer.unitScalingFactor = this.constModelInitializationScaleFactors[modelKey];
		var objBufferSource = globalResources.getLoadedResourceDataByKey(modelKey);
		var modelVertexData = ObjFormatBufferParserUtility.generateModelVertexDataFromObjBuffer(objBufferSource.resourceDataStore,
			vertexDefProcessorBoundsNormalizer, null, null);
		this.modelRefDimensionKeyValStore[modelKey] = this.modelDimensionsFromModelVertexData(modelVertexData);

		this.webGlBufferDataKeyValStore[modelKey] = 
			WebGlUtility.createWebGlBufferDataFromAggregateVertexData(globalResources.getMainCanvasContext(),
			modelVertexData.aggregateVertexData, this.constVertexSize);						
	}
}

/**
 * Decodes model data in preparation for rendering, applying any required
 *  post-processing, as necessary; reports progress visually during the
 *  preparation process. 
 *
 * completionFunction {function} Function invoked upon the completion of model data
 *                               preparation
 */
MainGingerManGameplayScene.prototype.prepareModelRenderData = function(completionFunction) {
	var modelKeys = this.getAllModelKeys();

	this.renderModelPreparationProgressIndicatorImmediate(0);

	if (modelKeys.length > 0) {
		var preparedModelCount = 0;

		for (var currentModelKey of modelKeys) {
			var sceneInstance = this;				
			function scheduleModelPreparation(targetModelKey) {
				
				function prepareModel () {
					sceneInstance.prepareModelRenderDataFromKeyedObjBuffer(targetModelKey);
					preparedModelCount++;
					sceneInstance.renderModelPreparationProgressIndicatorImmediate(preparedModelCount / modelKeys.length);
					
					if (preparedModelCount === modelKeys.length) {					
						setTimeout(completionFunction, 0);
					}
				}				
				setTimeout(prepareModel, 0);
			}
			
			scheduleModelPreparation(currentModelKey);
		}
	}
	else {
		completionFunction();
	}
}

MainGingerManGameplayScene.prototype.gingerManProtagonistModelKey = function () {
	return this.keyModelGingerBreadMan;
}

/**
 * Retrieves an array of unique keys that are used to reference enemy
 *  state/rendering data
 *
 * @return {Array} Array of unique string keys
 */
MainGingerManGameplayScene.prototype.getAllEnemyKeys = function () {
	return [
		this.keyModelEnemyGrinch,
		this.keyModelEnemyCoronaVirusMonster,
		this.keyModelEnemyBallOrnamentMonster,
		this.keyModelEnemyEvilChristmasTreeMonster,
		this.keyModelEnemyGumDropMonster,
	];
}

/**
 * Retrieves an array of unique keys that are used to reference goal
 *  object state/rendering data
 *
 * @return {Array} Array of unique string keys
 */
MainGingerManGameplayScene.prototype.getAllGoalObjectKeys = function () {
	return [
		this.keyModelHousePartDoor,
		this.keyModelHousePartRoofHalf,
		this.keyModelHousePartShortSide,
		this.keyModelHouseShortSideWithDoor,
		this.keyModelHousePartLongSideWithWindows
	];
}

/**
 * Retrieves an array of unique keys that are used to reference power-up
 *  object state/rendering data
 *
 * @return {Array} Array of unique string keys
 */
MainGingerManGameplayScene.prototype.getAllPowerUpObjectKeys = function () {
	return [
		this.keyModelPowerUpSpeed,
		this.keyModelPowerUpJump,
		this.keyModelPowerUpInvulnerability
	];
}

/**
 * Retrieves an array of unique keys that are used to reference dynamic
 *  object state/rendering data (goal objects and enemy objects)
 *
 * @return {Array} Array of unique string keys
 *
 * @see MainGingerManGameplayScene.getAllEnemyKeys
 * @see MainGingerManGameplayScene.getAllGoalObjectKeys 
 */
MainGingerManGameplayScene.prototype.getAllDynamicObjectKeys = function () {
	var enemyKeys = this.getAllEnemyKeys();	
	var inertObjectKeys = this.getAllGoalObjectKeys();
	var powerUpObjectKeys = this.getAllPowerUpObjectKeys();
	
	return inertObjectKeys.concat(powerUpObjectKeys.concat(enemyKeys));
}

/**
 * Retrieves an array of unique keys that are used to reference all
 *  dynamic model objects used within the game
 *
 * @return {Array} Array of unique string keys
 */
MainGingerManGameplayScene.prototype.getAllModelKeys = function () {
	var dynamicObjectKeys = this.getAllDynamicObjectKeys();

	var allModelKeys = [this.gingerManProtagonistModelKey()].concat(dynamicObjectKeys);

	return allModelKeys;
}

/**
 * Builds pre-determined matrices that are required to properly orient
 *  models, as necessary
 */
MainGingerManGameplayScene.prototype.generateDynamicElementPredeterminedMatrices = function () {
	var dynamicElementKeys = this.getAllModelKeys();

	for (currentDynamicElementKey of dynamicElementKeys) {
		var transformationMatrix = null;
		switch (currentDynamicElementKey) {
			case this.keyModelGingerBreadMan:
				var rotationAngleAxisX = -Math.PI / 2.0;
				var rotationAngleAxisY = Math.PI / 2.0;

				var xAxisRotation = MathUtility.generateRotationMatrix3dAxisX(rotationAngleAxisX);
				var yAxisRotation = MathUtility.generateRotationMatrix3dAxisY(rotationAngleAxisY);

				this.modelMatrixKeyValStore[currentDynamicElementKey] = yAxisRotation.multiply(xAxisRotation);
				break;
			case this.keyModelEnemyGrinch:
				var rotationAngleAxisY = Math.PI;

				var yAxisRotation = MathUtility.generateRotationMatrix3dAxisY(rotationAngleAxisY);

				this.modelMatrixKeyValStore[currentDynamicElementKey] = yAxisRotation;
				break;
			case this.keyModelEnemyCoronaVirusMonster:
				var rotationAngleAxisY = Math.PI;
				var yAxisRotation = MathUtility.generateRotationMatrix3dAxisY(rotationAngleAxisY);

				this.modelMatrixKeyValStore[currentDynamicElementKey] = yAxisRotation;
				break;
			case this.keyModelEnemyBallOrnamentMonster:
				var rotationAngleAxisX = -Math.PI / 2.0;
				var rotationAngleAxisY = 0.0;

				var xAxisRotation = MathUtility.generateRotationMatrix3dAxisX(rotationAngleAxisX);
				var yAxisRotation = MathUtility.generateRotationMatrix3dAxisY(rotationAngleAxisY);

				this.modelMatrixKeyValStore[currentDynamicElementKey] = yAxisRotation.multiply(xAxisRotation);
				break;
			case this.keyModelEnemyEvilChristmasTreeMonster:
				var rotationAngleAxisX = Math.PI / 2.0;
				var rotationAngleAxisY = Math.PI;
				var rotationAngleAxisZ = Math.PI;
				var xAxisRotation = MathUtility.generateRotationMatrix3dAxisX(rotationAngleAxisX);
				var yAxisRotation = MathUtility.generateRotationMatrix3dAxisY(rotationAngleAxisY);
				var zAxisRotation = MathUtility.generateRotationMatrix3dAxisZ(rotationAngleAxisZ);

				this.modelMatrixKeyValStore[currentDynamicElementKey] = zAxisRotation.multiply(yAxisRotation.multiply(xAxisRotation));
				break;
			case this.keyModelEnemyGumDropMonster:
				var rotationAngleAxisX = -Math.PI / 2.0;
				var rotationAngleAxisY = Math.PI / 1.4;

				var xAxisRotation = MathUtility.generateRotationMatrix3dAxisX(rotationAngleAxisX);
				var yAxisRotation = MathUtility.generateRotationMatrix3dAxisY(rotationAngleAxisY);

				this.modelMatrixKeyValStore[currentDynamicElementKey] = yAxisRotation.multiply(xAxisRotation);
				break;
			default:
				var defaultTransformationMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
					this.constTransformationMatrixColumnCount);
				defaultTransformationMatrix.setToIdentity();
				this.modelMatrixKeyValStore[currentDynamicElementKey] = defaultTransformationMatrix;
				break;
		}
		
		if (transformationMatrix !== null) {
			this.modelMatrixKeyValStore[currentDynamicElementKey] = transformationMatrix;
		}
	}
}

/**
 * Determines the approximate, pre-determined, render-space Z-plane bounding
 *  rectangle for the GingerMan protagonist.
 *
 * @return Rectangle Z-plane bounding rectangle for the dynamic
 *         element
 */
MainGingerManGameplayScene.prototype.determineGingerManProtagonistBoundingRectangle = function () {
	var renderSpaceDimensionX = this.modelRefDimensionKeyValStore[this.keyModelGingerBreadMan].dimensionY;
	var renderSpaceDimensionY = this.modelRefDimensionKeyValStore[this.keyModelGingerBreadMan].dimensionZ;

	return new Rectangle(
		WorldRepresentationUtility.worldSpaceLengthToRenderSpaceLength(
			this.currentWorldSpacePositionInLevel.xCoord,
			this.constWorldScale) - renderSpaceDimensionX / 2.0,
		WorldRepresentationUtility.worldSpaceLengthToRenderSpaceLength(
			this.currentWorldSpacePositionInLevel.yCoord,
			this.constWorldScale) + renderSpaceDimensionY / 2.0,
		renderSpaceDimensionX,
		renderSpaceDimensionY,
	);
}

/**
 * Determines the approximate, pre-determined, render-space Z-plane bounding
 *  rectangle for a dynamic element.
 *
 * @param dynamicElement {DynamicItemInstanceData} Data which defines instance-specific
 *                                                 attributes of a dynamic element
 *                                                 (position, etc.)
 *
 * @return Rectangle Z-plane bounding rectangle for the dynamic
 *         element
 */
MainGingerManGameplayScene.prototype.determineDynamicElementBoundingRectangle = function (dynamicElement) {
	var boundingRect = null;

	var renderSpaceDimensionX = 0.0;
	var renderSpaceDimensionY = 0.0;

	switch (dynamicElement.modelDataKey) {
		case this.keyModelPowerUpSpeed:
		case this.keyModelPowerUpJump:
		case this.keyModelPowerUpInvulnerability:
			renderSpaceDimensionX =
				this.modelRefDimensionKeyValStore[dynamicElement.modelDataKey].dimensionX;
			renderSpaceDimensionY =
				this.modelRefDimensionKeyValStore[dynamicElement.modelDataKey].dimensionY;
			break;
		case this.keyModelEnemyGrinch:
			renderSpaceDimensionX =
				this.modelRefDimensionKeyValStore[dynamicElement.modelDataKey].dimensionX;
			renderSpaceDimensionY =
				this.modelRefDimensionKeyValStore[dynamicElement.modelDataKey].dimensionY;
			break;
		case this.keyModelEnemyCoronaVirusMonster:
			renderSpaceDimensionX =
				this.modelRefDimensionKeyValStore[dynamicElement.modelDataKey].dimensionX;
			renderSpaceDimensionY =
				this.modelRefDimensionKeyValStore[dynamicElement.modelDataKey].dimensionY;
			break;
		case this.keyModelEnemyBallOrnamentMonster:
			renderSpaceDimensionX =
				this.modelRefDimensionKeyValStore[dynamicElement.modelDataKey].dimensionX;
			renderSpaceDimensionY =
				this.modelRefDimensionKeyValStore[dynamicElement.modelDataKey].dimensionY;
			break;
		case this.keyModelEnemyEvilChristmasTreeMonster:
			renderSpaceDimensionX =
				this.modelRefDimensionKeyValStore[dynamicElement.modelDataKey].dimensionX;
			renderSpaceDimensionY =
				this.modelRefDimensionKeyValStore[dynamicElement.modelDataKey].dimensionY;		
			break;
		case this.keyModelEnemyGumDropMonster:
			renderSpaceDimensionX =
				this.modelRefDimensionKeyValStore[dynamicElement.modelDataKey].dimensionX;
			renderSpaceDimensionY =
				this.modelRefDimensionKeyValStore[dynamicElement.modelDataKey].dimensionY;		
			break;		
		case this.keyModelHousePartDoor:
		case this.keyModelHousePartRoofHalf:
		case this.keyModelHousePartShortSide:
		case this.keyModelHouseShortSideWithDoor:
		case this.keyModelHousePartLongSideWithWindows:
			renderSpaceDimensionX =
				this.modelRefDimensionKeyValStore[dynamicElement.modelDataKey].dimensionX;
			renderSpaceDimensionY =
				this.modelRefDimensionKeyValStore[dynamicElement.modelDataKey].dimensionY;
			break;
		default:
			//renderSpaceDimensionX =
			//	this.modelRefDimensionKeyValStore[dynamicElement.modelDataKey].dimensionX;
			//renderSpaceDimensionY =
			//	this.modelRefDimensionKeyValStore[dynamicElement.modelDataKey].dimensionY;		
			break;
	}
	
	boundingRect = new Rectangle(
		WorldRepresentationUtility.worldSpaceLengthToRenderSpaceLength(
			dynamicElement.modelWorldSpacePosition.xCoord,
			this.constWorldScale) - renderSpaceDimensionX / 2.0,
		WorldRepresentationUtility.worldSpaceLengthToRenderSpaceLength(
			dynamicElement.modelWorldSpacePosition.yCoord,
			this.constWorldScale) + renderSpaceDimensionY / 2.0,
		renderSpaceDimensionX,
		renderSpaceDimensionY
	);

	return boundingRect;	
}

/**
 * Updates the internally-managed scroll offset, based upon the
 *  current world-space Ginger Man protagonist position
 */
MainGingerManGameplayScene.prototype.updateScrollOffset = function() {
	var scrollAreaMargin = 0.2;
	
	if (this.levelScrollManager != null) {
		// Absolute render space position (may exceed the boundaries of the
		// actual rendering viewport - will be contained within the rendering
		// viewport after the scroll position has been adjusted).
		var renderSpacePosition =
			WorldRepresentationUtility.worldSpacePositionToRenderSpacePosition(
				this.currentWorldSpacePositionInLevel.xCoord,
				this.currentWorldSpacePositionInLevel.yCoord,
				this.currentWorldSpacePositionInLevel.zCoord,
				this.constWorldScale);
		
		this.levelScrollManager.updateScrollPositionWithPoint(renderSpacePosition.xCoord,
			renderSpacePosition.yCoord);
	}
}

/**
 * Initializes game input bindings
 */
MainGingerManGameplayScene.prototype.setupInputEventHandler = function () {
	// Bind the keyboard input events...		
	this.inputEventInterpreter.bindInputEventToFunction(this.keyboardInputEventReceiver,
		this.keyboardInputEventReceiver.constKeySpecifierArrowUp,	
		this, this.handleInputForGingerManProtagonistMovementUp);
		
	this.inputEventInterpreter.bindInputEventToFunction(this.keyboardInputEventReceiver,
		this.keyboardInputEventReceiver.constKeySpecifierArrowDown,	
		this, this.handleInputForGingerManProtagonistMovementDown);

	this.inputEventInterpreter.bindInputEventToFunction(this.keyboardInputEventReceiver,
		this.keyboardInputEventReceiver.constKeySpecifierArrowLeft,	
		this, this.handleInputForGingerManProtagonistMovementLeft);
		
	this.inputEventInterpreter.bindInputEventToFunction(this.keyboardInputEventReceiver,
		this.keyboardInputEventReceiver.constKeySpecifierArrowRight,	
		this, this.handleInputForGingerManProtagonistMovementRight);
		
	this.inputEventInterpreter.bindInputEventToFunction(this.keyboardInputEventReceiver,
		this.keyboardInputEventReceiver.constKeySpecifierSpace,	
		this, this.handleInputForGingerManProtagonistJump);

	// Bind the touch movement input events...		
	this.inputEventInterpreter.bindInputEventToFunction(this.touchInputEventReceiver,
		this.touchInputEventReceiver.constTouchInputMoveSpecifierUp,	
		this, this.handleTouchInputForGingerManProtagonistMovementUp);
		
	this.inputEventInterpreter.bindInputEventToFunction(this.touchInputEventReceiver,
		this.touchInputEventReceiver.constTouchInputMoveSpecifierDown,	
		this, this.handleTouchInputForGingerManProtagonistMovementDown);

	this.inputEventInterpreter.bindInputEventToFunction(this.touchInputEventReceiver,
		this.touchInputEventReceiver.constTouchInputMoveSpecifierLeft,	
		this, this.handleTouchInputForGingerManProtagonistMovementLeft);
		
	this.inputEventInterpreter.bindInputEventToFunction(this.touchInputEventReceiver,
		this.touchInputEventReceiver.constTouchInputMoveSpecifierRight,	
		this, this.handleTouchInputForGingerManProtagonistMovementRight);
		
	this.inputEventInterpreter.bindInputEventToFunction(this.touchInputEventReceiver,
		this.touchInputEventReceiver.constTouchInputSpecifier,
		this, this.handleInputForGingerManProtagonistJump);

	// Bind the device orientation input events (mobile devices, etc.)
	this.inputEventInterpreter.bindInputEventToFunction(this.deviceAttitudeInputEventReceiver,
		this.deviceAttitudeInputEventReceiver.constAttitudeEffectiveTiltInputSpecifierLeft,
		this, this.handleInputForGingerManProtagonistMovementLeft);
		
	this.inputEventInterpreter.bindInputEventToFunction(this.deviceAttitudeInputEventReceiver,
		this.deviceAttitudeInputEventReceiver.constAttitudeEffectiveTiltInputSpecifierRight,
		this, this.handleInputForGingerManProtagonistMovementRight);
}

/**
 * Input handler for the input message(s) which represent the
 *  "move up" action (touch device)
 *
 * @param scalarInputEvent {ScalarInputEvent} Scalar-based input event which represents
 *                                            an input message that can represent varying
 *                                            input magnitudes
 */
MainGingerManGameplayScene.prototype.handleTouchInputForGingerManProtagonistMovementUp = function (scalarInputEvent) {
	this.handleInputForGingerManProtagonistMovementUp(scalarInputEvent);
}

/**
 * Input handler for the input message(s) which represent the
 *  "move down" action (touch device)
 *
 * @param scalarInputEvent {ScalarInputEvent} Scalar-based input event which represents
 *                                            an input message that can represent varying
 *                                            input magnitudes
 */
MainGingerManGameplayScene.prototype.handleTouchInputForGingerManProtagonistMovementDown = function (scalarInputEvent) {
	this.handleInputForGingerManProtagonistMovementDown(scalarInputEvent);	
}

/**
 * Input handler for the input message(s) which represent the
 *  "move left" action (touch device)
 *
 * @param scalarInputEvent {ScalarInputEvent} Scalar-based input event which represents
 *                                            an input message that can represent varying
 *                                            input magnitudes
 */
MainGingerManGameplayScene.prototype.handleTouchInputForGingerManProtagonistMovementLeft = function (scalarInputEvent) {
	this.handleInputForGingerManProtagonistMovementLeft(scalarInputEvent);
}

/**
 * Input handler for the input message(s) which represent the
 *  "move right" action (touch device)
 *
 * @param scalarInputEvent {ScalarInputEvent} Scalar-based input event which represents
 *                                            an input message that can represent varying
 *                                            input magnitudes
 */
MainGingerManGameplayScene.prototype.handleTouchInputForGingerManProtagonistMovementRight = function (scalarInputEvent) {
	this.handleInputForGingerManProtagonistMovementRight(scalarInputEvent);
}


/**
 * Input handler for the input message(s) which represent the
 *  "move up" action
 *
 * @param scalarInputEvent {ScalarInputEvent} Scalar-based input event which represents
 *                                            an input message that can represent varying
 *                                            input magnitudes
 */
MainGingerManGameplayScene.prototype.handleInputForGingerManProtagonistMovementUp = function (scalarInputEvent) {
	if (Utility.validateVarAgainstType(scalarInputEvent, ScalarInputEvent) && this.gameState.isInActiveOperationState()) {	
		
	}
}

/**
 * Input handler for the input message(s) which represent the
 *  "move down" action
 *
 * @param scalarInputEvent {ScalarInputEvent} Scalar-based input event which represents
 *                                            an input message that can represent varying
 *                                            input magnitudes
 */
MainGingerManGameplayScene.prototype.handleInputForGingerManProtagonistMovementDown = function (scalarInputEvent) {
	if (Utility.validateVarAgainstType(scalarInputEvent, ScalarInputEvent) && this.gameState.isInActiveOperationState()) {	
		
	}	
}

/**
 * Input handler for the input message(s) which represent the
 *  "move left" action
 *
 * @param scalarInputEvent {ScalarInputEvent} Scalar-based input event which represents
 *                                            an input message that can represent varying
 *                                            input magnitudes
 */
MainGingerManGameplayScene.prototype.handleInputForGingerManProtagonistMovementLeft = function (scalarInputEvent) {
	if (Utility.validateVarAgainstType(scalarInputEvent, ScalarInputEvent) && this.gameState.isInActiveOperationState()) {
		this.currentGingerManProtagonistAmbulationAccelerationAxisX = this.gingerManProtagonistAmbulationAccelerationMetersPerMsSq *
			-Math.pow(scalarInputEvent.inputUnitMagnitude, this.constDeviceAccelResultExpoFactor);
	}
}

/**
 * Input handler for the input message(s) which represent the
 *  "move right" action
 *
 * @param scalarInputEvent {ScalarInputEvent} Scalar-based input event which represents
 *                                            an input message that can represent varying
 *                                            input magnitudes
 */
MainGingerManGameplayScene.prototype.handleInputForGingerManProtagonistMovementRight = function (scalarInputEvent) {
	if (Utility.validateVarAgainstType(scalarInputEvent, ScalarInputEvent) && this.gameState.isInActiveOperationState()) {	
		this.currentGingerManProtagonistAmbulationAccelerationAxisX = this.gingerManProtagonistAmbulationAccelerationMetersPerMsSq *
			Math.pow(scalarInputEvent.inputUnitMagnitude, this.constDeviceAccelResultExpoFactor);
	}	
}

/**
 * Input handler for input message(s) which are intended
 *  to invoke a level restart (after a level progression
 *  termination event)
 *
 * @param scalarInputEvent {ScalarInputEvent} Scalar-based input event which represents
 *                                            an input message that can represent varying
 *                                            input magnitudes
 */
MainGingerManGameplayScene.prototype.handleInputForGingerManProtagonistJump = function (scalarInputEvent) {
	if (Utility.validateVarAgainstType(scalarInputEvent, ScalarInputEvent) &&
		(scalarInputEvent.inputUnitMagnitude > 0.0)
	) {
		if (this.gameState.isInActiveOperationState()) {
			if ((scalarInputEvent.inputUnitMagnitude > 0) &&
				this.isGingerManProtagonistInContactWithHorizSurface())
			{
				this.gingerManProtagonistJumpInitiated = true;
			}
		}
		else if (this.gameState.isInGameOverState()) {
			this.setupNewLevelState(this.currentLevelIndex);	
		}
		else if (this.gameState.isInGameCompletionState()) {
			this.setupNewLevelState(0);
		}
	}
}

/**
 * Retrieves a level representation derived from parsed
 *  [simple spactial] level specification data that
 *  is associated with a particular resource key
 *
 * @param {String} resourceKey Resource key that is
 *                 associated with the level specification
 *                 resource data
 *
 * @return {LevelRepresentation} A level representation object
 */
MainGingerManGameplayScene.prototype.levelRepresentationFromResourceKey = function(resourceKey) {
	var rawLevelData = globalResources.getLoadedResourceDataByKey(resourceKey);
	var levelSpecificationParser = new SpatialLevelSpecificationParser();
	levelSpecificationParser.parseSpatialLevelSpecificationBuffer(rawLevelData.resourceDataStore);

	return new LevelRepresentation(levelSpecificationParser);
}

/**
 * Retrieves the multiplier, associated with the immediate level,
 *  which dictates the rate at which the Ginger Man protagonist health
 *  decreases
 *
 * @return {Number} Duration multiplier, which is inversely
 *                  proportional to the rate at which the
 *                  health of the Ginger Man protagonist
 *                  diminishes
 */
MainGingerManGameplayScene.prototype.currentDurationMultiplier = function () {
	var durationMultiplier = 1.0;
	
	var retrievedMultiplier = Utility.returnValidNumOrZero(this.currentLevelRepresentation.timeDurationMultiplier);
	if (retrievedMultiplier > 0.0) {
		durationMultiplier = retrievedMultiplier;		
	}
	
	return durationMultiplier;
}

/**
 * Configures all gameplay factors that are associated with the
 *  initiation of properly-functioning initial-state level
 *  environment.
 *
 * @param levelIndex {Number} Index of the level that is to be initialized
 *                            to an initial-state status
 */
MainGingerManGameplayScene.prototype.setupNewLevelState = function(levelIndex) {
	this.currentLevelIndex = Utility.returnValidNumOrZero(levelIndex);

	this.gameState.setCurrentProtagonistFortitudeValue(this.constGingerManProtagonistMaxHealth);
	this.gameState.setMaxProtagonistFortitudeValue(this.constGingerManProtagonistMaxHealth);
	this.gameState.setOperationState(this.gameState.constOperationStateActive);
	this.gameState.setCurrentLevelIndex(levelIndex);
	this.currentGingerManProtagonistAmbulationAccelerationAxisX = 0.0;
	this.currentGingerManProtagonistVelocity = new Vector3d(0.0, 0.0, 0.0);
	this.currentGingerManProtagonistStaticModelDirectionBias = 1;
	this.enemyInstanceDataCollection.splice(0);
	this.goalItemInstanceDataCollection.splice(0);
	this.powerUpItemInstanceDataCollection.splice(0);

	this.setupLevelEnvironment();	
	this.discoveredGoalItemCount = 0;	
	this.totalGoalItemCount = this.goalItemInstanceDataCollection.length;
	this.goalStatusOverlayRenderer.setContentNeedsUpdate(true);

	this.gameState.invokeProtagonistGeneralInvulnerabilityPeriod(this.constGeneralInvulnerabilityDurationMs);
}

/**
 * Applies information pertinent to the new level to the
 *  internal level data store for the current game state
 */
MainGingerManGameplayScene.prototype.setupLevelEnvironment = function () {
	if ((this.currentLevelIndex >= 0) && (this.currentLevelIndex < this.levelKeyCollection.length)) {
		// Parse the loaded level...		
		var levelRepresentation = this.levelRepresentationFromResourceKey(this.levelKeyCollection[this.currentLevelIndex]);
		var backdropLevelRepresentation = (levelRepresentation.backdropLevel != null)
			? this.levelRepresentationFromResourceKey(levelRepresentation.backdropLevel)
			: null;

		// Set the scaling factors such that one tile is equivalent to one
		// world space unit
		levelRepresentation.setScaleFactors(this.constWorldScale, this.constWorldScale, this.constWorldScale);
		if (backdropLevelRepresentation != null) {
			backdropLevelRepresentation.setScaleFactors(this.constWorldScale, this.constWorldScale, this.constWorldScale);
		}

		this.currentLevelRepresentation = levelRepresentation;
		this.currentBackdropLevelRepresentation = backdropLevelRepresentation;

		if (Utility.validateVar(levelRepresentation.startPosition)) {
			this.currentWorldSpacePositionInLevel = new Point3d(levelRepresentation.startPosition.positionX,
				levelRepresentation.startPosition.positionY, this.constGingerManProtagonistRenderSpaceOffsetAxisZ);

			this.setupLevelScrollPosition(levelRepresentation);
		}

		if (Utility.validateVar(levelRepresentation.levelBackdropSpecifier)) {
			this.currentBackdropTextureKey = levelRepresentation.levelBackdropSpecifier;
		}

		// Extract level symbols that will be used as dynamic element (e.g.
		// collectible items, enemies).
		this.extractDynamicLevelSymbolsFromCurrentLevel();	
	}
}

/**
 * Extracts level symbols - elements that are encoded into the
 *  level that are not static level tiles - and properly
 *  places the represented item instances data into the level.
 */
MainGingerManGameplayScene.prototype.extractDynamicLevelSymbolsFromCurrentLevel = function () {
	if (Utility.validateVarAgainstType(this.currentLevelRepresentation, LevelRepresentation)) {
		
		var levelGridWidth = this.currentLevelRepresentation.getTileGridWidth();
		var levelGridHeight = this.currentLevelRepresentation.getTileGridHeight();
		
		for (var rowLoop = 0; rowLoop < levelGridHeight; rowLoop++) {
			for (var columnLoop = 0; columnLoop < levelGridWidth; columnLoop++) {			
				var tileAttributes = this.currentLevelRepresentation.getTileAttributesForTileAtPosition(rowLoop, columnLoop);
			
				if (tileAttributes !== null) {
					this.conditionallyExtractDynamicLevelSymbol(rowLoop, columnLoop)
				}
			}
		}			
	}
}

/**
 * Conditionally extracts a dynamic level element symbol - the
 *  extraction occurs only if the item at the specified level
 *  tile coordinates is a valid dynamic symbol
 *
 * @param rowIndex {Number} Index which references a row within the level tile
 *                          grid collection representation
 *
 * @param columnIndex {Number} Index which represents a column with the level
 *                             tile grid representation
 *
 * @return {Boolean} True if a dynamic level element was successfully
 *                   extracted
 */
MainGingerManGameplayScene.prototype.conditionallyExtractDynamicLevelSymbol = function(rowIndex, columnIndex) {
	var extractedSuccessfully = false;
	
	if (Utility.validateVarAgainstType(this.currentLevelRepresentation, LevelRepresentation) &&
		Utility.validateVar(rowIndex) && Utility.validateVar(columnIndex)) {
			
		var tileAttributes = this.currentLevelRepresentation.getTileAttributesForTileAtPosition(rowIndex, columnIndex);
		if ((tileAttributes !== null) && this.isDynamicLevelElementSymbol(tileAttributes)) {
			var tileRectInLevelSpace = this.currentLevelRepresentation.getTileRectInLevelSpace(rowIndex, columnIndex,
				0.0, 0.0);

			extractedSuccessfully = this.buildDynamicLevelElement(tileRectInLevelSpace, tileAttributes);
		}			
	}
	
	return extractedSuccessfully;
}

/**
 * Determines if a particular level tile, represented by a collection of
 *  tile attributes, defines a dynamic level element symbol (non-static
 *  tile, such as an enemy instance)
 *
 * @param tileAttributes {Object} Object with attributes that detail the
 *                                tile instance representation
 *
 * @return {Boolean} True if the provided tile attributes represent a dynamic level
 *                   element symbol
 */
MainGingerManGameplayScene.prototype.isDynamicLevelElementSymbol = function (tileAttributes) {
	return (Utility.validateVar(tileAttributes) && Utility.validateVar(tileAttributes.elementType));
}

/**
 * Creates a dynamic level element, using a particular set of object
 *  attributes.
 *
 * @param tileAttributes {Object} Attributes that define the dynamic element
 *                                to be created
 *
 * @return {DynamicItemInstanceData/EnemyInstanceData} Object which represents the appropriate
 *                                                     dynamic element
 */
MainGingerManGameplayScene.prototype.createDynamicLevelElement = function (tileAttributes) {
	var dynamicLevelElement = null;

	if (Utility.validateVar(tileAttributes)) {		
		switch (tileAttributes.elementType) {
			case this.constLevelSymbolTypeGoalSpecifier:
				dynamicLevelElement = new DynamicItemInstanceData();
				break;
			case this.constLevelSymbolTypePowerUpSpecifier:
				dynamicLevelElement = new PowerUpInstanceData();
				this.applyPowerUpTileAttributesToInstanceData(tileAttributes, dynamicLevelElement);
				break;
			case this.constLevelSymbolTypeEnemySpecifier:
				dynamicLevelElement = new EnemyInstanceData();
				if (Utility.validateVar(tileAttributes.contactDamage)) {
					dynamicLevelElement.contactDamage = Utility.returnValidNumOrZero(tileAttributes.contactDamage);
				}
				
				if (Utility.validateVar(tileAttributes.initMovementVelocityHoriz)) {
					dynamicLevelElement.velocityVector.xComponent = tileAttributes.initMovementVelocityHoriz / Constants.millisecondsPerSecond;
				}
				
				if (Utility.validateVar(tileAttributes.initMovementVelocityVert)) {
					dynamicLevelElement.velocityVector.yComponent = tileAttributes.initMovementVelocityVert / Constants.millisecondsPerSecond;
				}
				
				dynamicLevelElement.movementPatternSpecifier =
					this.dynamicElementMovementPatternFromTileAttributes(tileAttributes);
				
				if (Utility.validateVar(tileAttributes.actionIntervalMs)) {
					dynamicLevelElement.actionIntervalMs = tileAttributes.actionIntervalMs;
				}
				
				if (dynamicLevelElement.movementPatternSpecifier === this.constMovementPatternSpecifierPeriodicJump) {
					dynamicLevelElement.auxDataKeyValueStore[this.constEnemyDataKeyBaseVelocityX] =
						Utility.returnValidNumOrZero(tileAttributes.initMovementVelocityHoriz) /
						Constants.millisecondsPerSecond;
					dynamicLevelElement.auxDataKeyValueStore[this.constEnemyDataKeyBaseVelocityY] =
						Utility.returnValidNumOrZero(tileAttributes.initMovementVelocityVert) /
						Constants.millisecondsPerSecond;
				}
				break;					
			default:
				break;
		}
	}
	
	this.applyDynamicElementBaseAttributes(dynamicLevelElement, tileAttributes);
	
	return dynamicLevelElement;
}

/**
 * Extracts a dynamic element movement pattern specifier
 *  from parsed level tile attributes
 *
 * @param tileAttributes {Object} Attributes associated with a tile situated
 *                                at a particular location within the level
 *
 * @return {number} Value which corresponds to a particular movement pattern
 *
 * @see MainGingerManGameplayScene#constLevelSymbolTypeMovementPatternLinear
 * @see MainGingerManGameplayScene#constMovementPatternSpecifierPeriodicJump
 * @see MainGingerManGameplayScene#constMovementPatternBounce
 */
MainGingerManGameplayScene.prototype.dynamicElementMovementPatternFromTileAttributes = function (tileAttributes) {
	var movementPatternSpecifier = this.constMovementPatternSpecifierLinear;

	switch (tileAttributes.movementType) {
		case this.constLevelSymbolTypeMovementPatternLinear:
			movementPatternSpecifier = this.constMovementPatternSpecifierLinear;
			break;
		case this.constLevelSymbolTypeMovementPatternPeriodicJump:
			movementPatternSpecifier = this.constMovementPatternSpecifierPeriodicJump;
			break;
		case this.constLevelSymbolTypeMovementPatternBounce:
			movementPatternSpecifier = this.constMovementPatternBounce;
		default:
			break;
		
	}

	return movementPatternSpecifier;
}

/**
 * Builds a dynamic level element from the provided data, storing the element in
 *  the appropriate internal instance store
 *
 * @param tileRect {Rectangle} Bounding rectangle in the X-Y plane which defines the dynamic
 *                   element X-Y plane level/render-space boundaries
 * @param tileAttributes {Object} Attributes associated with a tile situated
 *                                at a particular location within the level
 *
 * @return {Boolean} True if the provided tile attributes represent a dynamic level
 *                   element symbol
 */
MainGingerManGameplayScene.prototype.buildDynamicLevelElement = function (tileRect, tileAttributes) {
	var builtSuccessfully = false;

	if (Utility.validateVar(tileAttributes)) {				
		var renderSpaceCenterX = tileRect.left + (tileRect.getWidth() / 2.0);
		var renderSpaceCenterY = tileRect.top - (tileRect.getHeight() / 2.0);

		var dynamicLevelElement = this.createDynamicLevelElement(tileAttributes);
			
		dynamicLevelElement.modelWorldSpacePosition =
			WorldRepresentationUtility.renderSpacePositionToWorldSpacePosition(
				renderSpaceCenterX,
				renderSpaceCenterY,
				0.0,
				this.constWorldScale
			);

		builtSuccessfully = this.storeDynamicLevelSymbolByType(dynamicLevelElement);
	}
	
	return builtSuccessfully;
}

/**
 * Applies capabilities associated with a power-up tile to the specified
 *  dynamic object instance that represents a power object that can be
 *  acquired within the gameplay scene
 *
 * @param tileAttributes {Object} Attributes associated with a tile situated
 *                                at a particular location within the level
 * @param powerUpInstanceData {PowerUpInstanceData} Power-up dynamic object instance
 *
 */
MainGingerManGameplayScene.prototype.applyPowerUpTileAttributesToInstanceData = function(tileAttributes, powerUpInstanceData) {
	if (Utility.validateVar(tileAttributes.speedMultiplier)) {
		powerUpInstanceData.powerUpType = this.constPowerUpNameSpeedMultiplier;
		powerUpInstanceData.powerUpValue = Utility.returnValidNumOrZero(tileAttributes.speedMultiplier);
	}

	if (Utility.validateVar(tileAttributes.jumpMultiplier)) {
		powerUpInstanceData.powerUpType = this.constPowerUpNameJumpMultiplier;
		powerUpInstanceData.powerUpValue = Utility.returnValidNumOrZero(tileAttributes.jumpMultiplier);
	}

	if (Utility.validateVar(tileAttributes.invulnerability)) {
		powerUpInstanceData.powerUpType = this.constPowerUpNameInvulnerability;
		powerUpInstanceData.powerUpValue = tileAttributes.invulnerability;
	}

	powerUpInstanceData.durationMs = Utility.returnValidNumOrZero(tileAttributes.durationMs);
}

/**
 * Applies defining attributes to a newly-created level element,
 *  finalizing the creation of a dynamic element
 *
 * @param levelElement {DynamicItemInstanceData/EnemyInstanceData} Dynamic level element which
 *                                                                 does not yet have specific
 *                                                                 attributes assigned
 * @param tileAttributes {Object} Collection of attributes to be assigned to/interpreted for
 *                                the levelElement
 */
MainGingerManGameplayScene.prototype.applyDynamicElementBaseAttributes = function (levelElement, tileAttributes) {
	if (Utility.validateVar(tileAttributes) && Utility.validateVar(tileAttributes.builtInModel)) {	
		if ((typeof this.webGlBufferDataKeyValStore[tileAttributes.builtInModel] !== "undefined") &&
			(typeof this.modelRefDimensionKeyValStore[tileAttributes.builtInModel] !== "undefined")) {	
				levelElement.modelDataKey = tileAttributes.builtInModel;
		}		
	}	
}

/**
 * Stores a dynamic level symbol within the appropriate item instance collection
 *
 * @param levelElement {DynamicItemInstanceData/EnemyInstanceData} Dynamic level item
 *                                                                 instance to be stored
 *
 */
MainGingerManGameplayScene.prototype.storeDynamicLevelSymbolByType = function (levelElement) {
	var storedSuccessfully = true;
	
	if (Utility.validateVarAgainstType(levelElement, DynamicItemInstanceData)) {
		this.goalItemInstanceDataCollection.push(levelElement);
	}
	else if (Utility.validateVarAgainstType(levelElement, EnemyInstanceData)) {
		this.enemyInstanceDataCollection.push(levelElement);
	}
	else if (Utility.validateVarAgainstType(levelElement, PowerUpInstanceData)) {
		this.powerUpItemInstanceDataCollection.push(levelElement);
	}
	else {
		storedSuccessfully = false;
	}
	
	return storedSuccessfully;
}

/**
 * Retrieves tile attributes associated with a level tile at the
 *  specified level tile model data grid coordinates
 *
 * @param basePosition {Point3d} Coordinates within the level tile grid
 *                               (Z component is ignored)
 * @param tileColumnOffset Column offset relative to the base position coordinates
 * @param tileRowOffset Row offset relative to the base position coordinates
 *
 * @param tileAttributes {Object} Collection of tile attributes associated
 *                                with a leveltile at the specified level
 *                                tile grid coodinates
 */
MainGingerManGameplayScene.prototype.tileAttributesAtWorldSpacePositionWithOffset = function(basePosition, tileColumnOffset, tileRowOffset) {
	var tileAttributes = null;
	
	if (Utility.validateVarAgainstType(basePosition, Point3d) && Utility.validateVar(tileColumnOffset) &&
		Utility.validateVar(tileRowOffset)) {

		var tileType = this.currentLevelRepresentation.getTileTypeAtPosition(
			Math.round(basePosition.yCoord) + tileRowOffset,
			Math.round(basePosition.xCoord) + tileColumnOffset);
		
		if (Utility.validateVar(tileType)) {
			tileAttributes = this.currentLevelRepresentation.getTileTypeAttributes(tileType);
		}
	}
	
	return tileAttributes;
}

/**
 * Retrieves the immediate render space bounding rectangle for the
 *  tile at the specified level model data tile grid coordinates
 *
 * @param basePosition {Point3d} Coordinates within the level tile grid
 *                               (Z component is ignored)
 * @param tileColumnOffset Column offset relative to the base position coordinates
 * @param tileRowOffset Row offset relative to the base position coordinates
 *
 *
 * @return {Rectangle} Level tile render space bounding rectangle
 *                     within the X-Y plane
 */
MainGingerManGameplayScene.prototype.tileRenderSpaceRectAtWorldSpacePositionWithOffset = function(basePosition, tileColumnOffset, tileRowOffset) {
	var tileRect = null;

	if (Utility.validateVarAgainstType(basePosition, Point3d) && Utility.validateVar(tileColumnOffset) &&
		Utility.validateVar(tileRowOffset)) {

		tileRect = this.currentLevelRepresentation.getTileRectInLevelSpace(
			Math.round(basePosition.yCoord) + tileRowOffset,
			Math.round(basePosition.xCoord) + tileColumnOffset, 0, 0);
	}

	return tileRect;
}

/**
 * Determines if a collision between the ginger man protagonist an a
 *  dynamic element within a collection elements exists
 *
 * @param dynamicItemInstanceCollection {Array} Array of DynamicItemInstanceData
 *                                              instances which represent
 *                                              dynamic elements situated within
 *                                              the active level
 *
 * @return {DynamicItemInstanceData} The first encountered item which has a
 *                                   bounding rectangle coincident with that
 *                                   of the GingerMan protagonist, null
 *                                   otherwise
 */
MainGingerManGameplayScene.prototype.evaluateGingerManProtagonistSingleInstanceItemCollisions = function(dynamicItemInstanceCollection) {
	var dynamicElement = null;

	var protagonistBoundingRect = this.determineGingerManProtagonistBoundingRectangle();

	var currentItemIndex = 0;
	var targetIndex = null;
	while ((targetIndex === null) && (currentItemIndex < dynamicItemInstanceCollection.length)) {
		var itemBoundingRectangle = this.determineDynamicElementBoundingRectangle(
			dynamicItemInstanceCollection[currentItemIndex]);
		if (protagonistBoundingRect.intersectsRect(itemBoundingRectangle)) {
			targetIndex = currentItemIndex;
		}

		currentItemIndex++;
	}

	if (targetIndex !== null) {
		dynamicElement = dynamicItemInstanceCollection[targetIndex];
		dynamicItemInstanceCollection.splice(targetIndex, 1);
	}

	return dynamicElement;
}

/**
 * Determines if the Ginger Man protagonist bounding rectangle is currently
 *  coincident with a goal item, and internally registers the goal item
 *  collection, as necessary
 */
MainGingerManGameplayScene.prototype.evaluateGingerManProtagonistGoalCollisions = function() {
	var protagonistBoundingRect = this.determineGingerManProtagonistBoundingRectangle();

	var coincidentGoal = this.evaluateGingerManProtagonistSingleInstanceItemCollisions(
		this.goalItemInstanceDataCollection);

	if (coincidentGoal !== null) {
		this.discoveredGoalItemCount++;
		this.goalStatusOverlayRenderer.setContentNeedsUpdate(true);
	}
}

/**
 * Determines if the Ginger Man protagonist bounding rectangle is currently
 *  coincident with a power-up item, and internally registers the power-up item
 *  collection, as necessary
 */
MainGingerManGameplayScene.prototype.evaluateGingerManProtagonistPowerUpCollisions = function() {
	var coincidentPowerUp = this.evaluateGingerManProtagonistSingleInstanceItemCollisions(
		this.powerUpItemInstanceDataCollection);

	if (coincidentPowerUp !== null) {
		this.activatePowerUp(
			coincidentPowerUp.powerUpType,
			coincidentPowerUp.powerUpValue,
			coincidentPowerUp.durationMs
		);
	}
}

/**
 * Determines if the Ginger Man protagonist bounding rectangle is currently
 *  coincident with an enemy dynamic instance, evaluating damage associated
 *  with the enemy instance contact, as necessary
 */
MainGingerManGameplayScene.prototype.evaluateGingerManProtagonistEnemyCollisions = function() {
	if (!this.gameState.protagonistIsInvulnerable) {
		var currentEnemyIndex = 0;
		var enemyWithIntersectingBoundingBox = null;

		var protagonistBoundingRect = this.determineGingerManProtagonistBoundingRectangle();

		while ((enemyWithIntersectingBoundingBox === null) && (currentEnemyIndex < this.enemyInstanceDataCollection.length)) {
			var itemBoundingRectangle = this.determineDynamicElementBoundingRectangle(
				this.enemyInstanceDataCollection[currentEnemyIndex])
			if (protagonistBoundingRect.intersectsRect(itemBoundingRectangle)) {
				enemyWithIntersectingBoundingBox = this.enemyInstanceDataCollection[currentEnemyIndex];				
			}
			else {
				currentEnemyIndex++;
			}
		}
		
		if (enemyWithIntersectingBoundingBox !== null) {
			this.evaluateGingerManProtagonistEnemyCollisionDamage(enemyWithIntersectingBoundingBox);
		}
	}
}

/**
 * Evaluates damage associated with an enemy instance object
 *
 * @param enemyInstance {EnemyInstanceData} Enemy instance associated with the
 *                                          application of damage to the Ginger Man
 *                                          protagonist
 */
MainGingerManGameplayScene.prototype.evaluateGingerManProtagonistEnemyCollisionDamage = function(enemyInstance) {
	if (Utility.validateVar(enemyInstance.contactDamage)) {
		this.registerGingerManProtagonistDamage(Utility.returnValidNumOrZero(enemyInstance.contactDamage));

		if (this.gameState.isAtNonViableFortitudeValue() && this.gameState.isInActiveOperationState()) {
			this.gameState.setOperationState(this.gameState.constOperationStateInactive);
		}
	}
}

/**
 * Applies a particular damage value to the Ginger Man protagonist, invoking
 *  any activites that are associated with damage reception (e.g.,
 *  game state change, etc.)
 *
 * @param damageValue {number} Unitless damage magnitude to be applied to the
 *                             Ginger Man protagonist
 */
MainGingerManGameplayScene.prototype.registerGingerManProtagonistDamage = function (damageValue) {
	if ((Utility.returnValidNumOrZero(damageValue) > 0.0) && !this.gameState.protagonistIsInvulnerable &&
		this.gameState.isInActiveOperationState()
	) {
		this.gameState.applyProtagonistDamage(Utility.returnValidNumOrZero(damageValue));
		this.gameState.invokeProtagonistGeneralInvulnerabilityPeriod(this.constGeneralInvulnerabilityDurationMs);

		if (this.gameState.isAtNonViableFortitudeValue()) {
			this.updateGingerManStateInformationForGameOverState();
		}
		else {
			this.invokeGingerManProtagonistDamageAnimation();
		}
	}
}

/**
 * Evaluates all immediate collisions with dynamic objects (e.g., enemy instances,
 *  power-up items), and initiates any associated activities when a
 *  collision has been detected
 */
MainGingerManGameplayScene.prototype.evaluateGingerManProtagonistDynamicItemCollisions = function() {
	this.evaluateGingerManProtagonistGoalCollisions();
	this.evaluateGingerManProtagonistPowerUpCollisions();
	this.evaluateGingerManProtagonistEnemyCollisions();
}

/**
 * Updates position attributes (location, velocity, etc.) immediately
 *  associated with the Ginger Man protagonist
 *
 * @param timeQuantum {number} Time delta with respect to the previously-executed
 *                             animation step (milliseconds)
 */
MainGingerManGameplayScene.prototype.updateGingerManProtagonistPositionalAttributes = function(timeQuantum) {
	// Update the position of the GingerMan protagonist
	this.currentWorldSpacePositionInLevel.xCoord +=
		(this.currentGingerManProtagonistVelocity.xComponent * timeQuantum);
	this.currentWorldSpacePositionInLevel.yCoord +=
		(this.currentGingerManProtagonistVelocity.yComponent * timeQuantum);
				
	this.currentWorldSpacePositionInLevel.zCoord +=
		(this.currentGingerManProtagonistVelocity.zComponent * timeQuantum);

	// Evaluate static object collisions, updating both the position and the
	// velocity of the GingerMan protagonist
	this.evaluateGingerManProtagonistStaticObjectCollisions(timeQuantum);

	// Update the velocity of the GingerMan protagonist
	this.updateGingerManProtagonistVelocity(timeQuantum);
	this.updateGingerManProtagonistModelStaticDirectionBias();
}

/**
 * Evaluates damage associated with the horizontal surface with
 *  which the Ginger Man protagonist is in contact, as necessary
 */
MainGingerManGameplayScene.prototype.evaluateGingerManProtagonistSurfaceContactDamage = function () {
	var renderSpaceBoundingRect = this.determineGingerManProtagonistBoundingRectangle();	
	
	var tileAttributes = this.tileAttributesForSurfaceTileAtRenderSpaceRectBottom(renderSpaceBoundingRect);
	if ((tileAttributes !== null) && this.doTileAttributesRepresentPhysicialTile(tileAttributes) &&
		(typeof tileAttributes.contactDamage === "number")
	) {
		this.registerGingerManProtagonistDamage(Utility.returnValidNumOrZero(tileAttributes.contactDamage));
	}
}

/**
 * Updates immediate game state attributes associated with the
 *  Ginger Man protagonist
 *
 * @param timeQuantum {number} Time delta with respect to the previously-executed
 *                             animation step (milliseconds)
 */
MainGingerManGameplayScene.prototype.updateGingerManProtagonistStateInformation = function(timeQuantum) {
	if (this.gameState.isInActiveOperationState()) {
		this.updateGingerManProtagonistPositionalAttributes(timeQuantum);
		this.updateGingerManProtagonistAnimationStates(timeQuantum);
		this.evaluateGingerManProtagonistSurfaceContactDamage();
	}
	else if (this.gameState.isInGameOverState()) {
		this.updateGingerManProtagonistPositionalAttributes(timeQuantum);		
	}
}

/**
 * Updates state information associated with the Ginger Man protagonist
 *  that is to be updated when transitioning from an active game play
 *  state to the "Game Over" state
 */
MainGingerManGameplayScene.prototype.updateGingerManStateInformationForGameOverState = function() {
	this.currentGingerManProtagonistAmbulationAccelerationAxisX = 0.0;
	this.invokeGingerManProtagonistGameOverAnimation();
}

/**
 * Updates immediate game state attributes associated with the
 *  all dynamic objects within the game (with the exception of the
 *  Ginger Man protagonist)
 *
 * @param timeQuantum {number} Time delta with respect to the previously-executed
 *                             animation step (milliseconds)
 */
MainGingerManGameplayScene.prototype.updateDynamicObjectStateInformation = function(timeQuantum) {
	if (this.gameState.isInActiveOperationState()) {
		for (currentDynamicInstanceData of this.enemyInstanceDataCollection) {
			this.updateDynamicObjectPosition(timeQuantum, currentDynamicInstanceData);
			this.udpateEnemyInstanceBehaviorState(timeQuantum, currentDynamicInstanceData);
		}
		
	}
}

/**
 * Updates the immediate velocity of the Ginger Man protagonist
 *
 * @param timeQuantum {number} Time delta with respect to the previously-executed
 *                             animation step (milliseconds)
 */
MainGingerManGameplayScene.prototype.updateGingerManProtagonistVelocity = function(timeQuantum) {
	var frictionCoefficient = this.frictionCoefficientForGingerManProtagonistSurface();
	if (!this.isGingerManProtagonistInContactWithHorizSurface()) {
		this.updateGingerManProtagonistVelocityAxisX(timeQuantum,
			this.currentGingerManProtagonistAmbulationAccelerationAxisX * this.gingerManProtagonistAerialAccelerationScaleFactor,
			this.gingerManProtagonistMaxAmbulationVelocity());

		// Update the protagonist [vertical] velocity change due to gravity.
		this.currentGingerManProtagonistVelocity.yComponent -= (this.constGravitationalAccelerationMetersPerMsSq *
			timeQuantum);
	}
	else {
		// Apply ambulation acceleration (with constrained velocity) to the
		// Ginger Man protagonist.
		this.updateGingerManProtagonistVelocityAxisX(timeQuantum,
			this.currentGingerManProtagonistAmbulationAccelerationAxisX * frictionCoefficient,
			this.gingerManProtagonistMaxAmbulationVelocity());

		if (this.currentGingerManProtagonistAmbulationAccelerationAxisX === 0.0) {
			// Progressively slow the Ginger Man protagonist if no active movement
			// acceleration is being applied.
			this.applyGingerManProtagonistAmbulationDeceleration(timeQuantum, frictionCoefficient);
		}

		if (this.gingerManProtagonistJumpInitiated) {
			this.currentGingerManProtagonistVelocity.yComponent = this.gingerManProtagonistInitialJumpVelocity();
			this.gingerManProtagonistJumpInitiated = false;
		}
		else {
			//this.currentGingerManProtagonistVelocity.yComponent = 0.0;
		}
	}
}

/**
 * Returns the current, maximum, permitted Ginger Man protagonist
 *  ambulation velocity (meters / millisecond)
 *
 * @return {number} Maximum Ginger Man protagonist ambulation velocity
 */
MainGingerManGameplayScene.prototype.gingerManProtagonistMaxAmbulationVelocity = function() {
	return this.currentGingerManProtagonistMaxAmbulationVelocity *
		((this.currentSpeedAttrEnhancementMultiplier != null)
			? this.currentSpeedAttrEnhancementMultiplier
			: 1.0)
}

/**
 * Returns the permitted initial jump velocity of the Ginger Man
 *  protagonist (meters / millisecond)
 */
MainGingerManGameplayScene.prototype.gingerManProtagonistInitialJumpVelocity = function() {
	return this.initialGingerManProtagonistJumpVelocityMetersPerMs *
		((this.currentJumpAttrEnhancmentMultiplier != null)
			? this.currentJumpAttrEnhancmentMultiplier
			: 1.0);
}

/**
 * Computes the immediate velocity of the Ginger Man protagonist along
 *  the X-axis, as a result of any acceleration being applied
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param accelerationAxisX {Number} Immediate acceleration being applied to the
 *                                   Ginger Man protagonist along the X-axis (m/millisecond²)
 * @param maxVelocityFromAcceleration {Number} Maximum permissible velocity that
 *                                             can be achieved through applied
 *                                             acceleration forces - acceleration
 *                                             will not be applied to if this
 *                                             velocity has been exceeded (m/millisecond²)
 */
MainGingerManGameplayScene.prototype.updateGingerManProtagonistVelocityAxisX = function (timeQuantum,
	accelerationAxisX, maxVelocityFromAcceleration) {

	// If the character has achieved a velocity greater than the maximum velocity
	// specified for the movement context for some reason, do not adjust the velocity
	// using the acceleration logic, as the resulting velocity may be improperly clamped.
	if (Math.abs(this.currentGingerManProtagonistVelocity.xComponent) <= Math.abs(maxVelocityFromAcceleration)) {
		this.currentGingerManProtagonistVelocity.xComponent = this.getSumWithMagnitudeClamp(
			this.currentGingerManProtagonistVelocity.xComponent,
			(accelerationAxisX * timeQuantum),
			maxVelocityFromAcceleration);
	}
	else if ((this.currentGingerManProtagonistVelocity.xComponent > 0.0) !== (accelerationAxisX > 0.0)) {
		// Permit the velocity to only be reduced if the horizontal velocity exceeds
		// the maximum specified velocity.
		this.currentGingerManProtagonistVelocity.xComponent = this.getSumWithMagnitudeClamp(
			this.currentGingerManProtagonistVelocity.xComponent,
			(accelerationAxisX * timeQuantum),
			this.currentGingerManProtagonistVelocity.xComponent);
	}	
}

/**
 * Applies deceleration to the Ginger Man protagonist
 *  velocity along the horizontal axis, as applicable
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {frictionCoefficient} Coefficient of friction
 *                                                  assigned to the level tile
 *                                                  surface
 */
MainGingerManGameplayScene.prototype.applyGingerManProtagonistAmbulationDeceleration = function(timeQuantum, frictionCoefficient) {	
	this.currentGingerManProtagonistVelocity.xComponent =
		this.applyDecelerationAlongAxis(timeQuantum, this.gingerManProtagonistAmbulationDecelerationMetersPerMsSq,
			frictionCoefficient, this.currentGingerManProtagonistVelocity.xComponent);
}

/**
 * Initiates the animation associated with the instant of
 *  Ginger Man protagonist damage reception
 */
MainGingerManGameplayScene.prototype.invokeGingerManProtagonistDamageAnimation = function() {
	this.timers.addTimer(new ExternalSourceTimer(this.constDamageAnimationDurationMs, function() {},
		this.constTimerIdDamageAnimation));
}

/**
 * Computes the time-based "skew" coefficient employed during
 *  the Ginger Man protagonist damage animation
 */
MainGingerManGameplayScene.prototype.gingerManProtagonistDamageAnimationSkewCoefficient = function() {
	var damageAnimationTimer = this.timers.timerWithId(this.constTimerIdDamageAnimation);

	return ((damageAnimationTimer != null) && (!damageAnimationTimer.isExpired()))
		? this.gingerManProtagonistDamageSkewCoefficientFromTimer(damageAnimationTimer)
		: 0.0;
}

/**
 * Computes the time-based "skew" coefficient employed during
 *  the Ginger Man protagonist damage animation
 *
 * @param {ExternalSourceTimer} Timer associated with the time-based skew
 *                              coefficient determination
 */
MainGingerManGameplayScene.prototype.gingerManProtagonistDamageSkewCoefficientFromTimer = function(timer) {
	var skewCoefficient = 0.0;
	
	if (Utility.validateVarAgainstType(timer, ExternalSourceTimer)) {
		var damageAngleSineSource = (2.0 * Math.PI * this.constDamageAnimationOscFrequencyX) * timer.elapsedTimeMs / Constants.millisecondsPerSecond;
		skewCoefficient = this.constDamageSkewCoefficientMaxMagnitude * Math.sin(damageAngleSineSource) *
			(1.0 - (timer.elapsedTimeMs / this.constDamageAnimationDurationMs));
	}

	return skewCoefficient;
}

/**
 * Initiates the animation associated with the instant of
 *  the Game Over state inception
 */
MainGingerManGameplayScene.prototype.invokeGingerManProtagonistGameOverAnimation = function() {
	this.timers.addTimer(new ExternalSourceTimer(this.constGameOverAnimationDurationMs, function() {},
		this.constTimerIdGameOverAnimation));
}

/**
 * Computes the time-based "flattening" coefficient employed during
 *  the Ginger Man protagonist game over animation
 */
MainGingerManGameplayScene.prototype.flatteningCoefficient = function() {
	var baseFlatteningCofficient = this.gameState.isInGameOverState()
		? this.constGameOverFlatteningCoefficient
		: 0.0;
	var resolvedFlatteningCoefficient = baseFlatteningCofficient;
		
	var flatteningCoefficientTimer = this.timers.timerWithId(this.constTimerIdGameOverAnimation);

	if ((flatteningCoefficientTimer != null) && (!flatteningCoefficientTimer.isExpired())) {
		resolvedFlatteningCoefficient = baseFlatteningCofficient *
			flatteningCoefficientTimer.elapsedTimeMs /
			this.constGameOverAnimationDurationMs;
	}

	return resolvedFlatteningCoefficient;
}

/**
 * Computes the time-based "deterioration factor" used to affect
 *  the Ginger Man protagonist surface appearance during the
 *  game over animation
 */
MainGingerManGameplayScene.prototype.deteriorationFactor = function() {
	var deteriorationFactor = this.gameState.isInGameOverState()
		? 1.0
		: 0.0;

	var flatteningCoefficientTimer = this.timers.timerWithId(this.constTimerIdGameOverAnimation);

	if ((flatteningCoefficientTimer != null) && (!flatteningCoefficientTimer.isExpired())) {
		deteriorationFactor = flatteningCoefficientTimer.elapsedTimeMs /
			this.constGameOverAnimationDurationMs;
	}		

	return deteriorationFactor;
}

/**
 * Applies deceleration to a velocity value along an axis
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param deceleration {number} Deceleration to be applied to the velocity
 *                              value (meters/millisecond²)
 * @param targetCanvasContext {frictionCoefficient} Coefficient of friction
 *                                                  assigned to the level tile
 *                                                  surface
 * @param axisVelocity {number} Velocity along an axis
 */
MainGingerManGameplayScene.prototype.applyDecelerationAlongAxis = function (timeQuantum, deceleration, frictionCoefficient, axisVelocity) {
	var newAxisVelocity = axisVelocity

	if (newAxisVelocity !== 0.0) {
		var decelerationDirectionBias = (axisVelocity > 0) ? -1.0 : 1.0;
			
		newAxisVelocity += (decelerationDirectionBias * deceleration * frictionCoefficient * timeQuantum);
		if ((newAxisVelocity * decelerationDirectionBias) > 0.0) {
			newAxisVelocity = 0.0;
		}
	}

	return newAxisVelocity;
}

/**
 * Returns the immediate direction bias of the Ginger Man protagonist model
 *  (indicates the direction that the model should be facing)  
 *  
 * @return {number} Direction (unit value) that the model should be facing - positive
 *                  number indicates the positive X-axis direction (right), while
 *                  a negative number indicates a negative X-axis direction (left)
 */
MainGingerManGameplayScene.prototype.getCurrentGingerManProtagonistModelDirectionBias = function () {
	var directionBias = 1.0;
	
	if (this.currentGingerManProtagonistAmbulationAccelerationAxisX === 0.0) {
		directionBias = this.currentGingerManProtagonistStaticModelDirectionBias;
	}
	else {
		if (this.currentGingerManProtagonistAmbulationAccelerationAxisX < 0) {
			directionBias = -1.0;
		}
	}
	
	return directionBias;
}

/**
 * Determines the direction "bias" for the Ginger Man protagonist - this value
 *  is used to determine the proper heading orientation of the Ginger Man
 *  protagonist model along the X-axis
 *
 * @return Direction bias for the Ginger Man protagonist composite model -
 *         -1.0 indicates the the model heading should be oriented
 *         along the negative X-axis direction, while 1.0 indicates that
 *         the model heading should be oriented along the positive
 *         X-axis direction
 */
MainGingerManGameplayScene.prototype.updateGingerManProtagonistModelStaticDirectionBias = function() {
	if (this.currentGingerManProtagonistAmbulationAccelerationAxisX !== 0.0) {
		this.currentGingerManProtagonistStaticModelDirectionBias = (this.currentGingerManProtagonistAmbulationAccelerationAxisX < 0) ? -1.0 : 1.0;
	}
}

/**
 * Updates the position of a single dynamic object, based upon the immediate
 *  object attributes (e.g., velocity)
 *
 * @param dynamicInstanceData {DynamicItemInstanceData} Information that represents
 *                                                      the dynamic object instance
 * @param timeQuantum {number} Time delta with respect to the previously-executed
 *                             animation step (milliseconds)
 */
MainGingerManGameplayScene.prototype.updateDynamicObjectPosition = function(timeQuantum, dynamicInstanceData) {
	if (Utility.validateVar(dynamicInstanceData)) {
		if (this.shouldApplyGravityToDynamicObjectInstance(dynamicInstanceData)) {
			dynamicInstanceData.velocityVector.yComponent -= (this.constGravitationalAccelerationMetersPerMsSq *
				timeQuantum);
			
			this.conditionallyApplyDynamicObjectSurfaceContactDeceleration(timeQuantum, dynamicInstanceData);
		}

		dynamicInstanceData.modelWorldSpacePosition.xCoord +=
			(dynamicInstanceData.velocityVector.xComponent * timeQuantum);
		dynamicInstanceData.modelWorldSpacePosition.yCoord +=
			(dynamicInstanceData.velocityVector.yComponent * timeQuantum);
	}
}

/**
 * Evaluates collisions between all dynamic elements and the
 *  level structure
 *
 * @param timeQuantum {number} Time delta with respect to the previously-executed
 *                             animation step (milliseconds)
 */
MainGingerManGameplayScene.prototype.evaluateDynamicElementStaticCollisions = function (timeQuantum) {
	for (var currentEnemyInstance of this.enemyInstanceDataCollection) {
		var enemyRenderSpaceRectangle = this.determineDynamicElementBoundingRectangle(
			currentEnemyInstance);
		var enemyWorldSpaceRectangle =
			WorldRepresentationUtility.renderSpaceRectToWorldSpaceRect(enemyRenderSpaceRectangle,
			this.constWorldScale);

		var enemyInstanceBody = new SimplifiedRectPhysicsBody(1.0,
			new Vector(
				currentEnemyInstance.velocityVector.xComponent,
				currentEnemyInstance.velocityVector.yComponent),
			this.restitutionCoefficientForEnemyInstance(currentEnemyInstance),
			enemyWorldSpaceRectangle);

		var alteredBody = this.evaluateDynamicObjectStaticObjectCollisions(timeQuantum,
			enemyInstanceBody);
		if (Utility.validateVarAgainstType(alteredBody, SimplifiedRectPhysicsBody)) {
			currentEnemyInstance.velocityVector = new Vector3d(
				alteredBody.velocity.xComponent,
				alteredBody.velocity.yComponent,
				0.0);

			var centerPoint2d = alteredBody.bounds.getCenter();
			if (!this.worldSpaceCoordAxisValuesAreCoincident(currentEnemyInstance.modelWorldSpacePosition.xCoord,
				centerPoint2d.getX())
			) {
				currentEnemyInstance.modelWorldSpacePosition.xCoord = centerPoint2d.getX();
			}

			if (!this.worldSpaceCoordAxisValuesAreCoincident(currentEnemyInstance.modelWorldSpacePosition.yCoord,
				centerPoint2d.getY())
			) {
				currentEnemyInstance.modelWorldSpacePosition.yCoord = centerPoint2d.getY();
			}
		}
	}
}

/**
 * Determines the effective coefficient of restitution (elasticity)
 *  associated with a particular enemy instance to be used
 *  during a collision with a level structure element
 *
 * @param enemyInstance {EnemyInstanceData} Enemy instance for which the
 *                                          coefficient of restitution is to
 *                                          be determined
 */
MainGingerManGameplayScene.prototype.restitutionCoefficientForEnemyInstance = function (enemyInstance) {
	var restitutionCoefficient = 0.0;

	if (Utility.validateVarAgainstType(enemyInstance, EnemyInstanceData)) {
		switch (enemyInstance.movementPatternSpecifier) {
			case this.constMovementPatternSpecifierLinear:
				restitutionCoefficient = 1.0;
				break;
			case this.constMovementPatternSpecifierPeriodicJump:
				restitutionCoefficient = this.periodicJumpDefaultRestitutionCoefficient;
				break;
			case this.constMovementPatternBounce:
				restitutionCoefficient = 1.0;
			default:
				break;
		}
	}

	return restitutionCoefficient;
}

/**
 * Determines if the vertical velocity of a particular
 *  enemy instance should be immediately affected by
 *  gravity
 *
 * @param enemyInstance {EnemyInstanceData} Enemy instance for the immediate
 *                                          evaluation of gravity should be
 *                                          determined
 */ 
MainGingerManGameplayScene.prototype.shouldApplyGravityToDynamicObjectInstance = function (enemyInstance) {
	return Utility.validateVarAgainstType(enemyInstance, EnemyInstanceData) &&
		((enemyInstance.movementPatternSpecifier === this.constMovementPatternSpecifierPeriodicJump) ||
		(enemyInstance.movementPatternSpecifier === this.constMovementPatternBounce));
}

/**
 * Applies deceleration to a particular dynamic element
 *  velocity along the horizontal axis, as applicable
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param dynamicElement {DynamicItemInstanceData/EnemyInstanceData} Dynamic element / enemy instance
 *                                                                   for which deceleration is to be
 *                                                                   potentially applied
 */
MainGingerManGameplayScene.prototype.conditionallyApplyDynamicObjectSurfaceContactDeceleration = function(timeQuantum, dynamicElement) {	
	if (Utility.validateVar(dynamicElement)) {
		var renderSpaceBoundingRect = this.determineDynamicElementBoundingRectangle(dynamicElement);
		if ((dynamicElement.movementPatternSpecifier === this.constMovementPatternSpecifierPeriodicJump) &&
			this.isRenderSpaceRectInContactWithHorizSurface(renderSpaceBoundingRect)
		) {
			var frictionCoefficient = Utility.validateVarAgainstType(renderSpaceBoundingRect, Rectangle)
				? this.frictionCoefficientForSurfaceTileAtRenderSpaceRectBottom(renderSpaceBoundingRect)
				: 1.0;

			// TODO: Move some form of this logic to SimplifiedRectPhysics
			if (Math.abs(dynamicElement.velocityVector.yComponent) <= Math.abs(this.constDynamicElementZeroVerticalVelocityThreshold)) {
				dynamicElement.velocityVector.yComponent = 0.0;
			}

			if (Math.abs(dynamicElement.velocityVector.yComponent) === 0.0) {
				dynamicElement.velocityVector.xComponent = this.applyDecelerationAlongAxis(
					timeQuantum, this.dynamicElementSurfaceDecelerationMetersPerMsSq,
					frictionCoefficient, dynamicElement.velocityVector.xComponent);
			}
		}
	}
}

/**
 * Updates state-based behavior information for a
 *  particular enemy instance 
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param enemyInstance {EnemyInstanceData} The enemy instance data for which
 *                                          the behavior is to be updated
 */
MainGingerManGameplayScene.prototype.udpateEnemyInstanceBehaviorState = function (timeQuantum, enemyInstance) {
	if (Utility.validateVarAgainstType(enemyInstance, EnemyInstanceData)) {
		if (enemyInstance.movementPatternSpecifier === this.constMovementPatternSpecifierPeriodicJump) {
			this.conditionallySetupEnemyPeriodicJumpTimer(timeQuantum, enemyInstance);
		}
	}
}

/**
 * Instantiates a timer used to periodically invoke a jump
 *  action for a particular enemy instance, if the
 *  enemy instance has been assigned a movement type
 *  of MainGingerManGameplayScene#constLevelSymbolTypeMovementPatternPeriodicJump
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param enemyInstance {EnemyInstanceData} The enemy instance data for which
 *                                          a jump invocation time will be
 *                                          assigned
 */
MainGingerManGameplayScene.prototype.conditionallySetupEnemyPeriodicJumpTimer = function (timeQuantum, enemyInstance) {
	var timerId = this.enemyJumpTimerId(enemyInstance);

	if ((timerId !== null) && Utility.validateVar(enemyInstance.actionIntervalMs) &&
		!this.timers.timerWithIdExists() &&
		(Math.abs(enemyInstance.velocityVector.yComponent) < 0.00009)
	) {
		var sceneInstance = this;
		this.timers.addTimer(
			new ExternalSourceTimer(
				enemyInstance.actionIntervalMs,
				function() {
					var directionMultiplier = (sceneInstance.currentWorldSpacePositionInLevel.xCoord > enemyInstance.modelWorldSpacePosition.xCoord)
						? 1.0
						: -1.0;
					enemyInstance.velocityVector.xComponent =
						enemyInstance.auxDataKeyValueStore[sceneInstance.constEnemyDataKeyBaseVelocityX] * directionMultiplier;
					enemyInstance.velocityVector.yComponent =
						enemyInstance.auxDataKeyValueStore[sceneInstance.constEnemyDataKeyBaseVelocityY];
				},
				timerId
			)
		);
	}	
}

/**
 * Generates a unique identifier to be used with timers
 *  associated with a particular enemy instance
 *
 * @param enemyInstance {EnemyInstanceData} The enemy instance data for a timer
 *                                          is to be associated
 *
 * @return {string} Unique timer identifier
 */
MainGingerManGameplayScene.prototype.enemyJumpTimerId = function (enemyInstance) {
	var timerId = null;

	if (Utility.validateVarAgainstType(enemyInstance, EnemyInstanceData)) {
		timerId = "Enemy_Jump_TimerId-" + enemyInstance.uniqueId;
	}
	
	return timerId;
}

/**
 * Applies a periodic, pre-determined health decrease to the Ginger
 *  Man protagonist
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 */
MainGingerManGameplayScene.prototype.applyTimeBasedGingerManProtagonistHealthDecrease = function (timeQuantum) {
	if (this.gameState.isInActiveOperationState()) {
		this.gameState.setCurrentProtagonistFortitudeValue(this.gameState.currentProtagonistFortitudeValue -
			(this.constGingerManProtagonistHealthDecreaseRatePerMs * timeQuantum /
			this.currentDurationMultiplier()));
	}

	if (this.gameState.isAtNonViableFortitudeValue() && this.gameState.isInActiveOperationState()) {
		this.gameState.setOperationState(this.gameState.constOperationStateInactive);
		this.updateGingerManStateInformationForGameOverState();
	}
}

/**
 * Returns the sum of two number, retaining the
 *  sign bias while clamping the resultant
 *  magnitude
 *
 * @param firstScalar First value of the sum
 * @param secondScalar Second value of the sum
 * @param maxMagnitude Maximum permissible sum magnitude
 *
 * @return {Number} A sum with a proper sign bias and clamped magnitude
 */
MainGingerManGameplayScene.prototype.getSumWithMagnitudeClamp = function (firstScalar, secondScalar, maxMagnitude) {
	var clampedResult = 0.0;
	
	if (Utility.validateVar(firstScalar) && Utility.validateVar(secondScalar) && Utility.validateVar(maxMagnitude)) {
		
		clampedResult = firstScalar + secondScalar;
		var signBias = (clampedResult > 0) ? 1.0 : -1.0;
		
		if (clampedResult > Math.abs(maxMagnitude)) {
			clampedResult = Math.abs(maxMagnitude) * signBias;	
		}			
	}
	
	return clampedResult;
}

/**
 * Evaluates collisions between the Ginger Man protagonist
 *  level structure
 *
 * @param timeQuantum {number} Time delta with respect to the previously-executed
 *                             animation step (milliseconds)
 */
MainGingerManGameplayScene.prototype.evaluateGingerManProtagonistStaticObjectCollisions = function(timeQuantum) {
	var renderSpacBoundingRect = this.determineGingerManProtagonistBoundingRectangle();
	
	var worldSpaceBoundingRect = WorldRepresentationUtility.renderSpaceRectToWorldSpaceRect(renderSpacBoundingRect,
		this.constWorldScale);
	
	var gingerManProtagonistBody = new SimplifiedRectPhysicsBody(1.0,
		new Vector(
			this.currentGingerManProtagonistVelocity.xComponent,
			this.currentGingerManProtagonistVelocity.yComponent),
		0.0,
		worldSpaceBoundingRect);

	var alteredBody = this.evaluateDynamicObjectStaticObjectCollisions(timeQuantum,
		gingerManProtagonistBody);
	if (Utility.validateVarAgainstType(alteredBody, SimplifiedRectPhysicsBody)) {
		this.currentGingerManProtagonistVelocity = new Vector3d(
			alteredBody.velocity.xComponent,
			alteredBody.velocity.yComponent,
			0.0);
		var centerPoint2d = alteredBody.bounds.getCenter();
			
		this.currentWorldSpacePositionInLevel = new Point3d(
			!this.worldSpaceCoordAxisValuesAreCoincident(centerPoint2d.getX(), this.currentWorldSpacePositionInLevel.getX())
				? centerPoint2d.getX()
				: this.currentWorldSpacePositionInLevel.getX(),
			!this.worldSpaceCoordAxisValuesAreCoincident(centerPoint2d.getY(), this.currentWorldSpacePositionInLevel.getY())
				? centerPoint2d.getY()
				: this.currentWorldSpacePositionInLevel.getY(),
			0.0);
	}
}

/**
 * Determines if the Ginger Man protagonist is in contact with
 *  a horizontal surface (ie. not floating/falling)
 *
 * @return {boolean} True if the Ginger Man protagonist is
 *                   in contact with a horitzontal surface
 */
MainGingerManGameplayScene.prototype.isGingerManProtagonistInContactWithHorizSurface = function() {
	var renderSpaceBoundingRect = this.determineGingerManProtagonistBoundingRectangle();

	return this.isRenderSpaceRectInContactWithHorizSurface(renderSpaceBoundingRect);
}

/**
 * Determines if an arbitrary, render-space rectangle is
 *  in contact with a horizontal surface (ie. not floating/falling)
 *
 * @return {boolean} True the render-space rectangle is in contact
 *                   with a horizontal surface
 */
MainGingerManGameplayScene.prototype.isRenderSpaceRectInContactWithHorizSurface = function(renderSpaceBoundingRect) {
	var inContactWithHorizontalSurface = false;

	if (Utility.validateVar(renderSpaceBoundingRect)) {
		var tileAttributes = this.tileAttributesForSurfaceTileAtRenderSpaceRectBottom(renderSpaceBoundingRect);
		inContactWithHorizontalSurface = (tileAttributes != null);
	}

	return inContactWithHorizontalSurface;
}

/**
 * Retrieves the attributes for a level tile representation that
 *  is in contact with the bottom of an arbitrary, render-space
 *  rectangle
 *
 * @param renderSpaceRect {Rectangle} Arbitrary rectangle in render-space coordinates
 * @return {Object} An object representing the attributes of the tile upon success,
 *                  null if the render-space rectangle is not in contact with a
 *                  surface
 */
MainGingerManGameplayScene.prototype.tileAttributesForSurfaceTileAtRenderSpaceRectBottom = function(renderSpaceRect) {
	var tileAttributes = null;

	if (Utility.validateVarAgainstType(renderSpaceRect, Rectangle)) {
		var worldSpaceBoundingRect = WorldRepresentationUtility.renderSpaceRectToWorldSpaceRect(renderSpaceRect,
			this.constWorldScale);
		var bottomCenterX = worldSpaceBoundingRect.getCenter().xCoord;
		// Collission evaluation situates the world space rect edges
		// SimplifiedRectPhysics.constNumberEpsilon away from each other,
		// the tile rect search must be applied beyond this margin.
		var bottomY = worldSpaceBoundingRect.top - worldSpaceBoundingRect.height - (2.0 * SimplifiedRectPhysics.constNumberEpsilon);
		var bottomCenterPoint = new Point3d(bottomCenterX, bottomY, 0.0);
		var preliminaryTileAttributes = this.tileAttributesAtWorldSpacePositionWithOffset(bottomCenterPoint, 0.0, 0.0);
		var tileRenderSpaceRect = this.tileRenderSpaceRectAtWorldSpacePositionWithOffset(bottomCenterPoint, 0.0, 0.0);
		var tileWorldSpaceRectTop = WorldRepresentationUtility.renderSpaceLengthToWorldSpaceLength(
			tileRenderSpaceRect.top, this.constWorldScale)

		if (this.worldSpaceCoordAxisValuesAreCoincident(bottomY, tileWorldSpaceRectTop) &&
			Utility.validateVar(preliminaryTileAttributes) &&
			(typeof preliminaryTileAttributes.frictionCoefficient === "number") &&
			this.doTileAttributesRepresentPhysicialTile(preliminaryTileAttributes)
		) {
			tileAttributes = preliminaryTileAttributes;
		}
	}

	return tileAttributes;
}

/**
 * Retrieves the assigned frction coefficient for a level tile
 *  representation that is in contact with the bottom of an
 *  arbitrary, render-space rectangle
 *
 * @param renderSpaceRect {Rectangle} Arbitrary rectangle in render-space coordinates
 * @return {Object} A tile friction coefficient upon success, 1.0 otherwise
 */
MainGingerManGameplayScene.prototype.frictionCoefficientForSurfaceTileAtRenderSpaceRectBottom = function(renderSpaceRect) {
	var frictionCoefficient = 1.0;

	if (Utility.validateVarAgainstType(renderSpaceRect, Rectangle)) {
		var tileAttributes = this.tileAttributesForSurfaceTileAtRenderSpaceRectBottom(renderSpaceRect);
		if (Utility.validateVar(tileAttributes)) {
			frictionCoefficient = tileAttributes.frictionCoefficient;
		}
	}

	return frictionCoefficient;
}

/**
 * Retrieves the defining attributes for a level tile situated at the
 *  specified render-space position
 *
 * @param renderSpacePosition {Point3d} Render space position in
 *                                      three-dimensional space
 *
 * @return {Object} Attributes associated with the represented
 *                  tile
 */
MainGingerManGameplayScene.prototype.tileAttributesForTileAtRenderSpacePosition = function(renderSpacePosition) {
	var tileAttributes = null;
	
	if (Utility.validateVarAgainstType(renderSpacePosition, Point3d)) {
		var tileColumnIndex = this.currentLevelRepresentation.getTileColumnIndexForLevelSpaceCoordX(
			renderSpacePosition.xCoord, 0.0);
		var tileRowIndex = this.currentLevelRepresentation.getTileRowIndexForLevelSpaceCoordY(
			renderSpacePosition.yCoord, 0.0);

		tileAttributes = this.currentLevelRepresentation.getTileAttributesForTileAtPosition(tileRowIndex, tileColumnIndex);
	}

	return tileAttributes;
}

/**
 * Determines if two coordinate values are approximately equal (floating point comparison)
 *
 * @param firstValue {number} The first number in the floating point
 *                            number comparison
 * @param secondValue {number} The second number in the floating point
 8                             number comparison
 *
 * @return True if the numbers are considered to be approximately
 *         equal
 */
MainGingerManGameplayScene.prototype.worldSpaceCoordAxisValuesAreCoincident = function(firstValue, secondValue) {
	return Math.abs(firstValue - secondValue) <= SimplifiedRectPhysics.constNumberEpsilon * 2.0 /* 100.0*/;
}

/**
 * Retrieves the assigned frction coefficient for a level tile
 *  representation that is in contact with the bottom of the
 *  render-space rectangle associated with the Ginger Man protagonist
 *
 * @return {Object} A tile friction coefficient upon success, 1.0 otherwise
 */
MainGingerManGameplayScene.prototype.frictionCoefficientForGingerManProtagonistSurface = function() {
	var renderSpaceBoundingRect = this.determineGingerManProtagonistBoundingRectangle();
	return Utility.validateVarAgainstType(renderSpaceBoundingRect, Rectangle)
		? this.frictionCoefficientForSurfaceTileAtRenderSpaceRectBottom(renderSpaceBoundingRect)
		: 1.0;
}

/**
 * @param timeQuantum {number} Time delta with respect to the previously-executed
 *                             animation step (milliseconds)
 * @param dynamicElementBody {SimplifiedRectPhysicsBody} Element representation
 *
 *
 *
 */
MainGingerManGameplayScene.prototype.evaluateDynamicObjectStaticObjectCollisions = function (timeQuantum,
	dynamicElementBody
) {
	if (Utility.validateVarAgainstType(dynamicElementBody, SimplifiedRectPhysicsBody)) {
		var alteredDynamicElementBody = dynamicElementBody.clone();
		var continueResultIteration = true;

		var constMaxIterations = 10;
		var iterationCount = 0;
		while (continueResultIteration && (iterationCount < constMaxIterations)) {
			var evaluatedCollisionSystems = this.aggregateEvaluatedDynamicObjectStaticObjectCollisionSystems(timeQuantum,
				alteredDynamicElementBody);

			var resolvedSystemBody = (evaluatedCollisionSystems != null)
				? this.resolveCollisionSystemResults(evaluatedCollisionSystems)
				: null;
			if (resolvedSystemBody != null) {
				alteredDynamicElementBody = resolvedSystemBody;
				if (this.resultsRequireIterativeResolution(evaluatedCollisionSystems)) {
					continueResultIteration = true;
				}
				else {
					continueResultIteration = false;
				}
			}
			else {
				continueResultIteration = false;
			}

			iterationCount++;
		}

		//alteredDynamicElementBody.elasticity = dynamicElementBody.elasticity;
	}

	return alteredDynamicElementBody;
}

/**
 * Evaluates collisions with adjacent, static level structure elements for
 *  a single dynamic element
 *
 * @param timeQuantum {number} Time delta with respect to the previously-executed
 *                             animation step (milliseconds)
 * @param dynamicElementBody {SimplifiedRectPhysicsBody} Representation of a
 *                                                       dynamic element which
 *                                                       can collide with
 *                                                       static level elements
 *
 * @return {Array} Array of SimplifiedRectPhysicsEvaluatedSystem
 *                          objects which each represent an evaluated
 *                          collision
 */
MainGingerManGameplayScene.prototype.aggregateEvaluatedDynamicObjectStaticObjectCollisionSystems = function (timeQuantum,
	dynamicElementBody
) {
	var evaluatedCollisionSystems = null;

	if (Utility.validateVarAgainstType(dynamicElementBody, SimplifiedRectPhysicsBody)) {
		// Tile span, away from the element location, in a single direction
		// along an axis, which describes the area in which a search will be
		// performed (the entire level does not need to be searched for
		// possible static object collisions).
		var tileSearchSpan = 3;
				
		var bodyCenter2d = dynamicElementBody.bounds.getCenter();
		var bodyCenter3d = new Point3d(bodyCenter2d.xCoord, bodyCenter2d.yCoord,
			0.0);
		evaluatedCollisionSystems = [];
		for (var tileColumnOffset = -tileSearchSpan; tileColumnOffset <= tileSearchSpan; tileColumnOffset++) {
			for (var tileRowOffset = -tileSearchSpan; tileRowOffset <= tileSearchSpan; tileRowOffset++) {
				var alteredDynamicElementBody = dynamicElementBody.clone();

				var tileAttributes = this.tileAttributesAtWorldSpacePositionWithOffset(
					bodyCenter3d, tileColumnOffset, tileRowOffset);
				if ((tileAttributes !== null) && this.doTileAttributesRepresentPhysicialTile(tileAttributes)) {
					var tileRect = this.tileRenderSpaceRectAtWorldSpacePositionWithOffset(bodyCenter3d,
						tileColumnOffset, tileRowOffset);
					var restitutionCoefficient = Math.max(
						Utility.returnValidNumOrZero(tileAttributes.restitutionCoefficient),
						Utility.returnValidNumOrZero(alteredDynamicElementBody.elasticity));

					// Assign equal restitution coefficients to evaluate total elasticity
					// in terms of the elasticity of the static object.
					alteredDynamicElementBody.elasticity = restitutionCoefficient;
					var tileBody = new SimplifiedRectPhysicsBody(Infinity, new Vector(0.0, 0.0),
						restitutionCoefficient, WorldRepresentationUtility.renderSpaceRectToWorldSpaceRect(tileRect, this.constWorldScale))
					var exclusionEdges = this.determineExclusionEdges(bodyCenter3d, tileColumnOffset, tileRowOffset);
					var evaluatedSystem = SimplifiedRectPhysics.evaluateCollision(alteredDynamicElementBody, tileBody,
						exclusionEdges);
					if (evaluatedSystem !== null) {
						evaluatedCollisionSystems.push(evaluatedSystem);
					}
				}
			}
		}
	}

	return evaluatedCollisionSystems;
}

/**
 * Determines which edges of a static level tile should be excluded
 *  from a collision evaluation operation due to adjacency-based
 *  collision probability
 *
 * @param basePosition {Point3d} Coordinates within the level tile grid
 *                               (Z component is ignored)
 * @param tileColumnOffset Column offset relative to the base position coordinates
 * @param tileRowOffset Row offset relative to the base position coordinates
 *
 * @return {Array} Collection of edges to be excluded from the collision
 *                 evaluation operation
 *
 * @see SimplifiedRectPhysics.rectEdge.left
 * @see SimplifiedRectPhysics.rectEdge.right
 * @see SimplifiedRectPhysics.rectEdge.bottom
 * @see SimplifiedRectPhysics.rectEdge.top
 */
MainGingerManGameplayScene.prototype.determineExclusionEdges = function (basePosition, tileColumnOffset, tileRowOffset) {
	var exclusionEdges = [];

	if (Utility.validateVarAgainstType(basePosition, Point3d) && Utility.validateVar(tileColumnOffset) &&
		Utility.validateVar(tileRowOffset)
	) {		
		if (this.doTileAttributesRepresentPhysicialTile(this.tileAttributesAtWorldSpacePositionWithOffset(
			basePosition, tileColumnOffset + 1, tileRowOffset))
		) {
			exclusionEdges.push(SimplifiedRectPhysics.rectEdge.left);
		}
		
		if (this.doTileAttributesRepresentPhysicialTile(this.tileAttributesAtWorldSpacePositionWithOffset(
			basePosition, tileColumnOffset - 1, tileRowOffset))
		) {
			exclusionEdges.push(SimplifiedRectPhysics.rectEdge.right);
		}
		
		if (this.doTileAttributesRepresentPhysicialTile(this.tileAttributesAtWorldSpacePositionWithOffset(
			basePosition, tileColumnOffset, tileRowOffset + 1))
		) {
			exclusionEdges.push(SimplifiedRectPhysics.rectEdge.bottom);
		}

		if (this.doTileAttributesRepresentPhysicialTile(this.tileAttributesAtWorldSpacePositionWithOffset(
			basePosition, tileColumnOffset, tileRowOffset - 1))
		) {
			exclusionEdges.push(SimplifiedRectPhysics.rectEdge.top);
		}
	}
	
	return exclusionEdges;
}

/**
 * Determines if mutliple iterations are required in order to
 *  resolve the collision system (multiple, concurrent
 *  collisions, etc.)
 *
 * @param collisionSystems {Array} Array of SimplifiedRectPhysicsEvaluatedSystem
 *                                 objects which each represent an evaluated
 *                                 collision
 *
 * @return True if the system requires iterative resolution,
 *         false otherwise
 */
MainGingerManGameplayScene.prototype.resultsRequireIterativeResolution = function (collisionSystems) {
	var hasHorizontalCollision = false;
	var hasVerticalCollision = false;

	if (Utility.validateVar(collisionSystems) && (collisionSystems.length > 1)) {
		var collisionIndex = 0;
		while (!hasHorizontalCollision && !hasVerticalCollision && (collisionIndex < collisionSystems.length)) {
			hasHorizontalCollision = this.collisionSystemContainsVerticalCollision(collisionSystems[collisionIndex]);
			hasVerticalCollision = this.collisionSystemContainsVerticalCollision(collisionSystems[collisionIndex]);

			collisionIndex++;
		}
	}

	return hasHorizontalCollision && hasVerticalCollision;
}

/**
 * Retrieves the first collision from a set of evaluated
 *  collisions (prioritizes vertical collisions)
 *
 * @param collisionSystems {Array} Array of SimplifiedRectPhysicsEvaluatedSystem
 *                                 objects which each represent an evaluated
 *                                 collision
 *
 * @return {SimplifiedRectPhysicsBody} A physics body representation of
 *                                     a collision result (contains new
 *                                     position/velocity resulting from
 *                                     collision)
 */
MainGingerManGameplayScene.prototype.resolveCollisionSystemResults = function (collisionSystems) {
	var alteredDynamicElementBody = null;
	
	var horizontalCollisions = collisionSystems.filter((collisionSystem) =>
		this.systemRepresentsHorizontalCollision(collisionSystem));

	var verticalCollisions = collisionSystems.filter((collisionSystem) =>
		this.systemRepresentsVerticalCollision(collisionSystem));

	if (verticalCollisions.length > 0) {
		alteredDynamicElementBody = verticalCollisions[0].body1;
	}
	else if (horizontalCollisions.length > 0) {
		alteredDynamicElementBody = horizontalCollisions[0].body1;
	}
	
	return alteredDynamicElementBody;
}

/**
 * Determines if the collision system was produced as a result
 *  of an evaluated horizontal (left/right) collision
 *
 * @param {SimplifiedRectPhysicsEvaluatedSystem} Represents an evaluated physical
 *                                               collision between two objects
 *
 * @return True if the system represents a horizontal collision
 */
MainGingerManGameplayScene.prototype.collisionSystemContainsHorizontalCollision = function (collisionSystem) {
	return Utility.validateVar(collisionSystem) && this.systemRepresentsHorizontalCollision(collisionSystem);
}

/**
 * Determines if the collision system was produced as a result
 *  of an evaluated vertical (top/bottom) collision
 *
 * @param {SimplifiedRectPhysicsEvaluatedSystem} Represents an evaluated physical
 *                                               collision between two objects
 *
 * @return True if the system represents a vertical collision
 */
MainGingerManGameplayScene.prototype.collisionSystemContainsVerticalCollision = function (collisionSystem) {
	return Utility.validateVar(collisionSystem) && this.systemRepresentsVerticalCollision(collisionSystem);
}

/**
 * Determines if the collision system was produced as a result
 *  of an evaluated horizontal (left/right) collision
 *
 * @param {SimplifiedRectPhysicsEvaluatedSystem} Represents an evaluated physical
 *                                               collision between two objects
 *
 * @return True if the system represents a horizontal collision
 */
MainGingerManGameplayScene.prototype.systemRepresentsHorizontalCollision = function (collisionSystem) {
	return (collisionSystem.collisionEdges.find((collisionEdge) =>
		(collisionEdge === SimplifiedRectPhysics.rectEdge.left) ||
		(collisionEdge === SimplifiedRectPhysics.rectEdge.right)) !== undefined);
}

/**
 * Determines if the collision system was produced as a result
 *  of an evaluated vertical (top/bottom) collision
 *
 * @param {SimplifiedRectPhysicsEvaluatedSystem} Represents an evaluated physical
 *                                               collision between two objects
 *
 * @return True if the system represents a vertical collision
 */
MainGingerManGameplayScene.prototype.systemRepresentsVerticalCollision = function (collisionSystem) {
	return (collisionSystem.collisionEdges.find((collisionEdge) =>
		(collisionEdge === SimplifiedRectPhysics.rectEdge.top) ||
		(collisionEdge === SimplifiedRectPhysics.rectEdge.bottom)) !== undefined);
}

/**
 * Evaluates collisions for all dynamic elements (including the Ginger Man
 *  protagonist), modifying positional attributes (e.g., velocity) and
 *  object state information as appropriate
 *
 * @param timeQuantum {number} Time delta with respect to the previously-executed
 *                             animation step (milliseconds)
 */
MainGingerManGameplayScene.prototype.evaluateCollisions = function (timeQuantum) {
	this.evaluateGingerManProtagonistDynamicItemCollisions();
	this.evaluateDynamicElementStaticCollisions(timeQuantum);
}

/**
 * Determines if the provided tile attributes represent a static level
 *  structure element
 *
 * @return True if the tile attributes represent a static level structure
 *         element
 */
MainGingerManGameplayScene.prototype.doTileAttributesRepresentPhysicialTile = function(tileAttributes) {
	return (Utility.validateVar(tileAttributes) &&
		!(Utility.validateVar(tileAttributes.representsEmptySpace) && (tileAttributes.representsEmptySpace === true)) &&
		!(Utility.validateVar(tileAttributes.startMarker) && (tileAttributes.startMarker === true)) &&
		!this.doTileAttributesRepresentDynamicElement(tileAttributes));
}

/**
 * Determines if the provided tile attributes represent a dynamic level
 *  level element (e.g., enemy, power-up)
 *
 * @return True if the tile attributes represent a dynamic level
 *         element
 */
MainGingerManGameplayScene.prototype.doTileAttributesRepresentDynamicElement = function(tileAttributes) {
	return (Utility.validateVar(tileAttributes) &&
		((tileAttributes.elementType === this.constLevelSymbolTypeGoalSpecifier) ||
		(tileAttributes.elementType === this.constLevelSymbolTypePowerUpSpecifier) ||
		(tileAttributes.elementType === this.constLevelSymbolTypeEnemySpecifier))
	);
}

/**
 * Updates any immediate animation states for the Ginger Man protagonist,
 *  based upon the internally-maintained state data
 *
 * @param timeQuantum {number} Time delta with respect to the previously-executed
 *                             animation step (milliseconds)
 */
MainGingerManGameplayScene.prototype.updateGingerManProtagonistAnimationStates = function(timeQuantum) {
	if (this.gameState.protagonistIsInvulnerable) {
		this.gameRenderStateUtility.incrementInvulnerabilityFrameCount();
	}
	else {
		this.gameRenderStateUtility.resetInvulnerabilityFrameCount();
	}
}

/**
 * Determines if the Ginger Man protagonist should be rendered
 *  at the present moment
 *
 * @return {boolean} True if the rabbit protagonist should be
 *                   rendered
 */
MainGingerManGameplayScene.prototype.shouldRenderGingerManProtagonist = function(timeQuantum, targetCanvasContext) {
	return (!this.gameState.protagonistIsInvulnerable || this.gameRenderStateUtility.shouldRenderProtagonist()) ||
		!this.gameState.isInActiveOperationState();
}

/**
 * Updates state information for all world objects (enemy items/dynamic items,
 *  Ginger Man protagonist)
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 */
MainGingerManGameplayScene.prototype.updateStateInformationForWorldObjects = function(timeQuantum) {
	this.updateGingerManProtagonistStateInformation(timeQuantum);
	this.updateDynamicObjectStateInformation(timeQuantum);
}

/**
 * Updates state information associated with the level representation
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 */
MainGingerManGameplayScene.prototype.updateStateInformationForLevel = function (timeQuantum) {
	this.updateScrollOffset();
}

/**
 * Updates state information associated with the game operational state
 *  (e.g., game active state, game over state, etc.)
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 */
MainGingerManGameplayScene.prototype.updateStateInformationForOperationLogic = function (timeQuantum) {
	if (this.goalItemInstanceDataCollection.length <= 0) {
		if (this.gameState.currentLevelIndex < (this.gameState.levelCount - 1)) {
			if (this.gameState.isInActiveOperationState()) {
				if (!this.fadeTransitionController.isTransitionInProgress()) {
					var sceneInstance = this;
					sceneInstance.gameState.setOperationState(sceneInstance.gameState.constOperationStateInterLevelPause);
					this.fadeTransitionController.invokeTransition(function() {
						sceneInstance.gameState.currentLevelIndex++;			
						sceneInstance.setupNewLevelState(sceneInstance.gameState.currentLevelIndex);
						sceneInstance.gameState.setOperationState(sceneInstance.gameState.constOperationStateInterLevelPauseCompletion);
						sceneInstance.fadeTransitionController.invokeTransitionContinuation(function() {
							sceneInstance.gameState.setOperationState(sceneInstance.gameState.constOperationStateActive);
						});
					})
				}
			}
		}
		else {
			// Game completed
			this.gameState.setOperationState(this.gameState.constOperationStateInterLevelPause);
		}
	}
	else {
		this.applyTimeBasedGingerManProtagonistHealthDecrease(timeQuantum);
	}
}

/**
 * Voids all active power-up states
 */
MainGingerManGameplayScene.prototype.clearPowerUpStatuses = function() {
	this.currentSpeedAttrEnhancementMultiplier = null;
	this.currentJumpAttrEnhancmentMultiplier = null;
	this.currentInvulnerabilityAttrEnhancementActive = null;
}

/**
 * Activates the power-up defined by the provided
 *  information (only one power-up may be active
 *  at a single time)
 *
 * @param powerUpName {String} Classification of power-up
 *                             to be activated
 * @param value {Object} Value specific to particular power-up types,
 *                       representing the initial state of the
 *                       power-up
 * @param {durationMs} Duration of the power-up activation
 *                     (milliseconds)
 */
MainGingerManGameplayScene.prototype.activatePowerUp = function(powerUpName, value, durationMs) {
	this.clearPowerUpStatuses();
	this.applyPowerUpValues(powerUpName,
		(powerUpName !== this.constPowerUpNameInvulnerability) ? value : durationMs);

	var resolvedDurationMs = Utility.returnValidNumOrZero(durationMs);
	var sceneInstance = this;
	this.timers.addTimer(
		new ExternalSourceTimer(
			resolvedDurationMs,
			function() {
				sceneInstance.clearPowerUpStatuses();
			},
			this.constTimerIdPowerUp
		)
	);
}

/**
 * Applies values associated with the defined
 *  power-up to the global, active power-up
 *  state information store
 *
 * @param powerUpName {String} Classification of power-up
 *                             to be activated
 * @param value {Object} Value specific to particular power-up types,
 *                       representing the initial state of the
 *                       power-up
 */
MainGingerManGameplayScene.prototype.applyPowerUpValues = function(powerUpName, value) {
	if (Utility.validateVar(powerUpName) && Utility.validateVar(value)) {
		switch (powerUpName) {
			case this.constPowerUpNameSpeedMultiplier:
				var multiplier = Utility.returnValidNumOrZero(value);
				this.currentSpeedAttrEnhancementMultiplier = multiplier > 0.0 ? multiplier : 1.0;
				break;
			case this.constPowerUpNameJumpMultiplier:
				var multiplier = Utility.returnValidNumOrZero(value);
				this.currentJumpAttrEnhancmentMultiplier = multiplier > 0.0 ? multiplier : 1.0;
				break;
			case this.constPowerUpNameInvulnerability:
				var durationMs = Utility.returnValidNumOrZero(value);
				this.currentInvulnerabilityAttrEnhancementActive = durationMs > 0;
				this.gameState.invokeProtagonistGeneralInvulnerabilityPeriod(durationMs);
				break;
		}
	}
}

/**
 * Updates all time-dependent game state information
 */
MainGingerManGameplayScene.prototype.updateGameState = function(timeQuantum)  {
	this.updateStateInformationForOperationLogic(timeQuantum);	
	this.gameState.updateGameStateWithTimeQuantum(timeQuantum);
	this.fadeTransitionController.updateTransitionWithTimeQuantum(timeQuantum);
	this.timers.updateActiveTimers(timeQuantum);
}

/**
 * Converts a point, represented in world-space units (meters), to render-space
 *  units which are translated based on the current protagonist position within
 *  the level (the translation is required to properly render only on-screen
 *  portions of the level)
 *
 * @param coordX {Number} World-space X-axis length specification, in meters
 * @param coordY {Number} World-space Y-axis length specification, in meters
 * @param coordZ {Number} World-space Z-axis length specification, in meters
 *
 * @return {Point3d} Render-space position specification
 */
MainGingerManGameplayScene.prototype.worldSpacePositionToTranslatedRenderSpacePosition = function (coordX, coordY, coordZ) {	
	
	var renderSpacePosition = null;
	
	if (this.levelScrollManager !== null) {
		var renderSpaceVisibleRect = this.levelScrollManager.scrollSpaceVisibleRect();

		/*r offsetFromStartX = this.worldSpaceLengthToRenderSpaceLength(this.currentLevelRepresentation.startPosition.positionX) -
			this.levelScrollManager.viewPortCenterPointX;
		var offsetFromStartY = this.worldSpaceLengthToRenderSpaceLength(this.currentLevelRepresentation.startPosition.positionY) -
			this.levelScrollManager.viewPortCenterPointY;	
		
		var baseRenderSpacePositionInLevel = this.worldSpacePositionToRenderSpacePosition(this.currentWorldSpacePositionInLevel.xCoord,
			this.currentWorldSpacePositionInLevel.yCoord, this.currentWorldSpacePositionInLevel.zCoord)*/
		
		var renderSpacePositionX = WorldRepresentationUtility.worldSpaceLengthToRenderSpaceLength(coordX, this.constWorldScale) - renderSpaceVisibleRect.left - this.levelScrollManager.viewPortSizeX / 2.0;
		var renderSpacePositionY = WorldRepresentationUtility.worldSpaceLengthToRenderSpaceLength(coordY, this.constWorldScale) - renderSpaceVisibleRect.top - this.levelScrollManager.viewPortSizeY / 2.0;
		var renderSpacePositionZ = WorldRepresentationUtility.worldSpaceLengthToRenderSpaceLength(coordZ, this.constWorldScale) - 0.0;
		
		renderSpacePosition = new Point3d(renderSpacePositionX, renderSpacePositionY, renderSpacePositionZ);
	}
	else {
		renderSpacePosition = WorldRepresentationUtility.worldSpacePositionToRenderSpacePosition(renderSpacePositionX, renderSpacePositionY, renderSpacePositionZ, this.constWorldScale);
	}
	
	return renderSpacePosition;
}

/**
 * Converts a point, represented in render-space units, to render-space
 *  units which are translated based on the current protagonist position within
 *  the level (the translation is required to properly render only on-screen
 *  portions of the level)
 *
 * @param coordX {Number} Render-space X-axis length specification, in meters
 * @param coordY {Number} Render-space Y-axis length specification, in meters
 * @param coordZ {Number} Render-space Z-axis length specification, in meters
 *
 * @return {Point3d} Render-space position specification
 */
MainGingerManGameplayScene.prototype.renderSpacePositionToTranslatedRenderSpacePosition = function (coordX, coordY, coordZ) {
	return this.worldSpacePositionToTranslatedRenderSpacePosition(
		WorldRepresentationUtility.renderSpaceLengthToWorldSpaceLength(coordX, this.constWorldScale),
		WorldRepresentationUtility.renderSpaceLengthToWorldSpaceLength(coordY, this.constWorldScale),
		WorldRepresentationUtility.renderSpaceLengthToWorldSpaceLength(coordZ, this.constWorldScale));
}

/**
 * Configures the initial scroll position, based upon the
 *  initial Ginger Man protagonist world-space position
 *
 * @param levelRepresentation {LevelRepresentation} Parsed level data representation
 */
MainGingerManGameplayScene.prototype.setupLevelScrollPosition = function (levelRepresentation) {
	// Retrieve the render-space tile grid dimensions...
	var tileGridDimensions = levelRepresentation.getTileGridDimensions();
	
	var mainCanvasContext = globalResources.getMainCanvasContext();
	
	var viewPortSizeX = mainCanvasContext.canvas.width
	var viewPortSizeY = mainCanvasContext.canvas.height
	
	this.levelScrollManager	= new LevelScrollManager(tileGridDimensions.xDelta, tileGridDimensions.yDelta);
	
	if (Utility.validateVar(levelRepresentation.startPosition)) {
		this.levelScrollManager.viewPortCenterPointX =
			WorldRepresentationUtility.worldSpaceLengthToRenderSpaceLength(
				levelRepresentation.startPosition.positionX, this.constWorldScale);
		this.levelScrollManager.viewPortCenterPointY =
			WorldRepresentationUtility.worldSpaceLengthToRenderSpaceLength(
				levelRepresentation.startPosition.positionY, this.constWorldScale);
	}
}	


/**
 * Clears the target alpha buffer, preventing compositing of the
 * output with the canvas - should be invoked at the end of the
 *  immediate frame
 *
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 */
MainGingerManGameplayScene.prototype.clearAlpha = function(targetCanvasContext) {
	// Clear alpha
	targetCanvasContext.clearColor(1.0, 1.0, 1.0, 1.0);
	targetCanvasContext.colorMask(false, false, false, true);
	targetCanvasContext.clear(targetCanvasContext.COLOR_BUFFER_BIT);
}

/**
 * Generates the perspective transformation matrix used
 *  to apply a perspective transformation to all rendered
 *  geometry that is not purposed as an overlay
 *
 * @return {MathExt.Matrix} Perspective transformation matrix
 */
MainGingerManGameplayScene.prototype.perspectiveMatrix = function() {
	var perspectiveMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount, this.constTransformationMatrixColumnCount);	
	perspectiveMatrix.setToIdentity();
	
	var nearZ = -1.0;
	var farZ = 1.0;
	var bottomY = -1.0;
	var topY = 1.0;
	var leftX = -1.0;
	var rightX = 1.0;


	perspectiveMatrix.setElementValues(
		/*[
			new Float32Array([nearZ / rightX, 			0.0, 					0.0,										0.0 ]),
			new Float32Array([0.0,					nearZ/topY, 				0.0,										0.0 ]),
			new Float32Array([0.0,						0.0, 		-(farZ + nearZ) / (farZ - nearZ),		-2 * farZ * nearZ / (farZ - nearZ)]),
			new Float32Array([0.0, 						0.0, 					-1.0,										0.0])
		]*/
		[
			new Float32Array([1.0, 						0.0, 					0.0,										0.0 ]),
			new Float32Array([0.0,						1.0,	 				0.0,										0.0 ]),
			new Float32Array([0.0,						0.0, 					1.0,										0.0]),
			new Float32Array([0.0, 						0.0, 					1.0,										1.0])
		]
	);
	
	return perspectiveMatrix;
}

/**
 * Updates the game goal status canvas/bitmap
 */
MainGingerManGameplayScene.prototype.updateGameGoalText = function() {
	var gameGoalStatusString =
		Constants.stringGoalStatusLabel + this.discoveredGoalItemCount + Constants.stringGoalCountSeparator + this.totalGoalItemCount;
	
	this.goalStatusTextCanvasBuffer.updateStaticTextString(gameGoalStatusString);
}

/**
 * Function used to generate the goal status content
 *
 * return {function} Callback used to generate goal status
 *                   overlay content
 * @see CanvasTextureOverlayRenderer
 */
MainGingerManGameplayScene.prototype.goalStatusContentGenerator = function () {
	var sceneInstance = this;
	
	return function(targetCanvasContext, overlayCanvasContext, overlayTexture) {
		if (Utility.validateVar(targetCanvasContext) && Utility.validateVar(targetCanvasContext) &&
			Utility.validateVar(overlayTexture)
		) {
			sceneInstance.updateGameGoalText();

			var coordX = 0;
			sceneInstance.goalStatusTextCanvasBuffer.renderText(overlayCanvasContext, coordX, 0);
		}
	}
}

/**
 * Function used to generate the spirit meter label content
 *
 * return {function} Callback used to generate the spirit meter
 *                   label content
 * @see CanvasTextureOverlayRenderer
 */
MainGingerManGameplayScene.prototype.spiritMeterLabelContentGenerator = function () {
	var sceneInstance = this;
	
	return function(targetCanvasContext, overlayCanvasContext, overlayTexture) {
		if (Utility.validateVar(targetCanvasContext) && Utility.validateVar(targetCanvasContext) &&
			Utility.validateVar(overlayTexture)
		) {
			sceneInstance.spiritMeterLabelTextCanvasBuffer.updateStaticTextString(Constants.stringVitalityLabel);
			
			sceneInstance.spiritMeterLabelTextCanvasBuffer.renderText(overlayCanvasContext, 0, 0);
		}
	}
}

/**
 * Function used to generate the content that is displayed within
 *  the status overlay area
 *
 * return {function} Callback used to generate the game status
 *                   overlay content scrim
 * @see CanvasTextureOverlayRenderer
 */
MainGingerManGameplayScene.prototype.statusScrimContentGenerator = function () {
	var sceneInstance = this;
	
	return function(targetCanvasContext, overlayCanvasContext, overlayTexture) {
		if (Utility.validateVar(targetCanvasContext) && Utility.validateVar(targetCanvasContext) &&
			Utility.validateVar(overlayTexture)
		) {
			var coordX = 0;
			
			overlayCanvasContext.clearRect(0, 0, overlayCanvasContext.canvas.width, overlayCanvasContext.canvas.height);
			overlayCanvasContext.fillStyle = sceneInstance.constGameEndOverlayBackgroundColor.getRgbaIntValueAsStandardString();
			overlayCanvasContext.fillRect(0, 0, overlayCanvasContext.canvas.width, overlayCanvasContext.canvas.height);

			overlayCanvasContext.save();
			overlayCanvasContext.fillStyle = sceneInstance.defaultTextAreaBackgroundColor.getRgbaIntValueAsStandardString();
			
			overlayCanvasContext.fillRect(0, 0, overlayCanvasContext.canvas.width, sceneInstance.goalStatusTextCanvasBuffer.getTextAreaHeight());
				
			overlayCanvasContext.restore();
		}
	}	
}

/**
 * Renders the semi-transparent background used to
 *  improve readability of overlays within the
 *  game status area
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 */
MainGingerManGameplayScene.prototype.renderOverlayScrim = function(timeQuantum, targetCanvasContext) {
	var unitSpiritMagnitude = this.gameState.currentProtagonistFortitudeValue / this.gameState.maxProtagonistFortitudeValue;
	
	var webGlAttributeLocationData = this.getStandardShaderWebGlAttributeLocations(true);
	var webGlAttributeData = this.getDefaultWebGlAttributeData();
	
	this.gameStatusOverlayScrimRenderer.renderOverlay(targetCanvasContext, webGlAttributeLocationData,
		webGlAttributeData, this.shaderStandardOverlayTextureRender);
}

/**
 * Renders the spirit meter overlay
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 */
MainGingerManGameplayScene.prototype.renderSpiritMeterOverlay = function(timeQuantum, targetCanvasContext) {
	var unitSpiritMagnitude = this.gameState.currentProtagonistFortitudeValue / this.gameState.maxProtagonistFortitudeValue;
	
	var webGlAttributeLocationData = this.getStandardShaderWebGlAttributeLocations(true);
	var webGlAttributeData = this.getDefaultWebGlAttributeData();
	
	this.spiritMeterRenderer.renderSpiritMeterOverlay(timeQuantum, targetCanvasContext,
		unitSpiritMagnitude, webGlAttributeLocationData, webGlAttributeData,
		this.shaderSpiritMeterTextureClip);
}

/**
 * Renders the spirit meter label/descriptive text overlay
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 */
MainGingerManGameplayScene.prototype.renderSpiritMeterLabelOverlay =  function(timeQuantum, targetCanvasContext) {
	var webGlAttributeLocationData = this.getStandardShaderWebGlAttributeLocations(true);
	var webGlAttributeData = this.getDefaultWebGlAttributeData();
	
	this.spiritMeterLabelTextRenderer.renderOverlay(targetCanvasContext, webGlAttributeLocationData,
		webGlAttributeData, this.shaderStandardOverlayTextureRender);
}

/**
 * Renders the goal progress status overlay
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 */
MainGingerManGameplayScene.prototype.renderGoalStatusOverlay = function(timeQuantum, targetCanvasContext) {
	var webGlAttributeLocationData = this.getStandardShaderWebGlAttributeLocations(true);
	var webGlAttributeData = this.getDefaultWebGlAttributeData();

	this.goalStatusOverlayRenderer.renderOverlay(targetCanvasContext, webGlAttributeLocationData,
		webGlAttributeData, this.shaderStandardOverlayTextureRender);
}

/**
 * Renders the texture-backed game over overlay
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 */
MainGingerManGameplayScene.prototype.renderGameEndOverlay = function(timeQuantum, targetCanvasContext) {
	if (this.gameState.isInGameOverState()) {
		var webGlAttributeLocationData = this.getStandardShaderWebGlAttributeLocations(true);
		var webGlAttributeData = this.getDefaultWebGlAttributeData();

		this.gameEndOverlayRenderer.renderOverlay(targetCanvasContext, webGlAttributeLocationData,
			webGlAttributeData, this.shaderStandardOverlayTextureRender);
	}
}

/**
 * Renders the texture-backed game completion overlay
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 */
MainGingerManGameplayScene.prototype.renderGameCompletionOverlay = function(timeQuantum, targetCanvasContext) {
	if (this.gameState.isInGameCompletionState()) {
		var webGlAttributeLocationData = this.getStandardShaderWebGlAttributeLocations(true);
		var webGlAttributeData = this.getDefaultWebGlAttributeData();

		this.gameCompletionOverlayRenderer.renderOverlay(targetCanvasContext, webGlAttributeLocationData,
			webGlAttributeData, this.shaderStandardOverlayTextureRender);
	}
}

/**
 * Function used to generate the content that is displayed within
 *  the game end overlay
 *
 * return {function} Callback used to generate the game end
 *                   overlay content
 * @see CanvasTextureOverlayRenderer
 */
MainGingerManGameplayScene.prototype.gameEndOverlayContentGenerator = function () {
	var sceneInstance = this;

	return function(targetCanvasContext, overlayCanvasContext, overlayTexture) {
		if (Utility.validateVar(targetCanvasContext) && Utility.validateVar(targetCanvasContext) &&
			Utility.validateVar(overlayTexture)) {

			overlayCanvasContext.clearRect(0, 0, overlayCanvasContext.canvas.width, overlayCanvasContext.canvas.height);
			overlayCanvasContext.fillStyle = sceneInstance.constGameEndOverlayBackgroundColor.getRgbaIntValueAsStandardString();
			overlayCanvasContext.fillRect(0, 0, overlayCanvasContext.canvas.width, overlayCanvasContext.canvas.height);
			
			var gameOverTextBuffer = new StaticTextLineCanvasBuffer(Constants.gameOverFontSizePx,
				Constants.labelFont, Constants.labelFontStyle);
			gameOverTextBuffer.updateStaticTextString(Constants.stringGameOver);
			
			var happyHolidaysTextBuffer = new StaticTextLineCanvasBuffer(Constants.labelFontSizePx,
				Constants.labelFont, Constants.labelFontStyle);
			happyHolidaysTextBuffer.updateStaticTextString(Constants.messageText);
			
			var retryInstructionsTextBuffer = new StaticTextLineCanvasBuffer(Constants.labelFontSizePx,
				Constants.labelFont, Constants.labelFontStyle);
			retryInstructionsTextBuffer.updateStaticTextString(Constants.stringSpaceTapToRetry);

			var topCoord = (overlayCanvasContext.canvas.height - (gameOverTextBuffer.requiredRenderingCanvasHeight() + 
				happyHolidaysTextBuffer.requiredRenderingCanvasHeight())) / 2.0;
			var gameOverLeftCoord = (overlayCanvasContext.canvas.width - gameOverTextBuffer.requiredRenderingCanvasWidth()) / 2.0;
			var happyHolidaysLeftCoord = (overlayCanvasContext.canvas.width - happyHolidaysTextBuffer.requiredRenderingCanvasWidth()) / 2.0;
			var retryInstructionsLeftCoord = (overlayCanvasContext.canvas.width - retryInstructionsTextBuffer.requiredRenderingCanvasWidth()) / 2.0;
			var retryInstructionsBottomMargin = 20.0;

			gameOverTextBuffer.renderText(overlayCanvasContext, gameOverLeftCoord, topCoord);
			happyHolidaysTextBuffer.renderText(overlayCanvasContext, happyHolidaysLeftCoord,
				topCoord + gameOverTextBuffer.requiredRenderingCanvasHeight());		
			retryInstructionsTextBuffer.renderText(overlayCanvasContext, retryInstructionsLeftCoord,
				overlayCanvasContext.canvas.height - (retryInstructionsTextBuffer.requiredRenderingCanvasHeight() +
				retryInstructionsBottomMargin));
		}
	}
}

/**
 * Function used to generate the content that is displayed within
 *  the game completion overlay
 *
 * return {function} Callback used to generate the game completion
 *                   overlay content
 * @see CanvasTextureOverlayRenderer
 */
MainGingerManGameplayScene.prototype.gameCompletionOverlayContentGenerator = function () {
	var sceneInstance = this;

	return function(targetCanvasContext, overlayCanvasContext, overlayTexture) {
		if (Utility.validateVar(targetCanvasContext) && Utility.validateVar(targetCanvasContext) &&
			Utility.validateVar(overlayTexture)
		) {
			overlayCanvasContext.clearRect(0, 0, overlayCanvasContext.canvas.width, overlayCanvasContext.canvas.height);
			overlayCanvasContext.fillStyle = sceneInstance.constGameEndOverlayBackgroundColor.getRgbaIntValueAsStandardString();
			overlayCanvasContext.fillRect(0, 0, overlayCanvasContext.canvas.width, overlayCanvasContext.canvas.height);
					
			var gameCompletionTextBuffer = new StaticTextLineCanvasBuffer(Constants.gameCompletedFontSizePx,
				Constants.labelFont, Constants.labelFontStyle);
			gameCompletionTextBuffer.updateStaticTextString(Constants.stringGameCompleted);
			
			var gameCompletionDetailTextBuffer = new StaticTextLineCanvasBuffer(Constants.labelFontSizePx,
				Constants.labelFont, Constants.labelFontStyle);
			gameCompletionDetailTextBuffer.updateStaticTextString(Constants.stringGameCompletedDetail);
			
			var happyHolidaysTextBuffer = new StaticTextLineCanvasBuffer(Constants.labelFontSizePx,
				Constants.labelFont, Constants.labelFontStyle);
			happyHolidaysTextBuffer.updateStaticTextString(Constants.messageText);		

			var totalRequiredTextHeight = gameCompletionTextBuffer.requiredRenderingCanvasHeight() +
				gameCompletionDetailTextBuffer.requiredRenderingCanvasHeight() + 
				happyHolidaysTextBuffer.requiredRenderingCanvasHeight();
			var topCoord = (overlayCanvasContext.canvas.height - totalRequiredTextHeight) / 2.0;
			
			var gameCompletionLeftCoord = (overlayCanvasContext.canvas.width - gameCompletionTextBuffer.requiredRenderingCanvasWidth()) / 2.0;
			var gameCompletionDetailLeftCoord = (overlayCanvasContext.canvas.width - gameCompletionDetailTextBuffer.requiredRenderingCanvasWidth()) / 2.0;			
			var happyHolidaysLeftCoord = (overlayCanvasContext.canvas.width - happyHolidaysTextBuffer.requiredRenderingCanvasWidth()) / 2.0;

			gameCompletionTextBuffer.renderText(overlayCanvasContext, gameCompletionLeftCoord, topCoord);
			gameCompletionDetailTextBuffer.renderText(overlayCanvasContext, gameCompletionDetailLeftCoord,
				topCoord + gameCompletionTextBuffer.requiredRenderingCanvasHeight());
			happyHolidaysTextBuffer.renderText(overlayCanvasContext, happyHolidaysLeftCoord,
				topCoord + gameCompletionTextBuffer.requiredRenderingCanvasHeight() +
				2.0 * gameCompletionDetailTextBuffer.requiredRenderingCanvasHeight());		
		}
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
MainGingerManGameplayScene.prototype.renderFadeOverlay = function(timeQuantum, targetCanvasContext) {
	this.fadeOverlayRenderer.renderFadeOverlay(timeQuantum, targetCanvasContext,
		globalResources.getFullScreenOverlayTexture(),
		this.fullScreenOverlayWebGlData,
		this.shaderBlackFader,
		this.getDefaultWebGlAttributeData(),
		this.getStandardShaderWebGlAttributeLocations(true));
}

/**
 * Renders a textured backdrop, scrollable tiled backdrop
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 */
MainGingerManGameplayScene.prototype.renderBackdrop = function(timeQuantum, targetCanvasContext) {
	if (this.currentBackdropTextureKey !== null) {
		var backdropTexture = globalResources.textureKeyValueStore[this.currentBackdropTextureKey];
		
		var backdropRenderWebGlData = WebGlUtility.objectRenderWebGlDataFromWebGlBufferData(	
			this.webGlBufferDataKeyValStore[this.backdropLevelVertexBufferKey], this.shaderBackdropRender);
		
		var transformationMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
			this.constTransformationMatrixColumnCount);
		transformationMatrix.setToIdentity();
		var webGlAttributeLocationData = this.getStandardShaderWebGlAttributeLocations(true);
		var webGlAttributeData = this.getDefaultWebGlAttributeData();	

		var textureOffsetX = ((this.levelScrollManager.viewPortCenterPointX) / 2.0) / this.constBackdropScrollRateDivisor;
		var textureOffsetY = ((this.levelScrollManager.viewPortCenterPointY) / 2.0) / this.constBackdropScrollRateDivisor;
		var textureSize = globalResources.textureSizeKeyValueStore[this.currentBackdropTextureKey];		
		function textureCoordOffsetUniformSetup(shaderProgram) {
			var textureOffsetUniformLocation = targetCanvasContext.getUniformLocation(shaderProgram, "vTextureCoordOffset");
			targetCanvasContext.uniform2fv(textureOffsetUniformLocation, [textureOffsetX, textureOffsetY]);
			
			var textureDimensionsUniformLocation = targetCanvasContext.getUniformLocation(shaderProgram, "vTextureDimensions");
			targetCanvasContext.uniform2iv(textureDimensionsUniformLocation, new Int32Array(textureSize));
		}
		
		WebGlUtility.renderGeometry(backdropRenderWebGlData, transformationMatrix, transformationMatrix, backdropTexture,
			targetCanvasContext, webGlAttributeLocationData, webGlAttributeData, textureCoordOffsetUniformSetup);
	}	
}

/**
 * Renders a single level tile at the specified render-space region
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 * @param tileRenderWebGlData {ObjectRenderWebGlData} A set of buffers that contain the
 *                                                    WebGL representation of the level
 *                                                    tile to be rendered
 * @param renderSpaceTileRect {Rectangle} Render-space rectangle which specifies the
 *                                        region in which the tile will be rendered
 * @param tileTexture {WebGLTexture} Texture to be applied to the level
 *                                   tile
 * @param attributeLocationData {WebGlUtility.AttributeLocationData()} A collection
 *																		of expected attribute
 *                                                						location specifiers
 * @param attributeData {WebGlUtility.AttributeData} Object that contains the attribute values
 *                                                   be supplied to the shader 
 */
MainGingerManGameplayScene.prototype.renderLevelTile = function(timeQuantum, targetCanvasContext, tileRenderWebGlData,
	renderSpaceTileRect, zOffset, tileTexture, attributeLocationData, attributeData, useDarkeningOscillation) {
		
	var uniformLookupKey = "LevelTile";
		
	var transformationMatrix = MathUtility.generateTranslationMatrix3d(
		renderSpaceTileRect.getCenter().getX(),
		renderSpaceTileRect.getCenter().getY(),
		Utility.returnValidNumOrZero(zOffset));
		
	var constMinDarkeningMultiplier = 0.6;
	var constOscillationRateDivisor = 100.0;
	var sceneInstance = this;
	var multiplier = useDarkeningOscillation
		? ((Math.sin(this.totalElapsedSceneTimeMs / constOscillationRateDivisor) + 1.0) / 2.0 * (1.0 - constMinDarkeningMultiplier)) + constMinDarkeningMultiplier
		: 1.0;
	WebGlUtility.renderGeometry(tileRenderWebGlData, transformationMatrix, this.perspectiveMatrix(),
		tileTexture, targetCanvasContext, attributeLocationData, attributeData,
		this.levelTileDarkeningMultUniformSetupFunction(targetCanvasContext, uniformLookupKey, this, multiplier),
		function(targetCanvasContext, shaderProgram, uniformName) {
			return sceneInstance.resolveCachedUniformLocation(targetCanvasContext, uniformLookupKey, shaderProgram, uniformName)
		});
}

/**
 * Function used to apply shader uniform values when rendering
 *  level tiles (passed to WebGlUtility#renderGeometry)
 */
MainGingerManGameplayScene.prototype.levelTileDarkeningMultUniformSetupFunction = function (targetCanvasContext, lookUpKey, sceneInstance, multiplier) {
	return function (shaderProgram) {
		var multiplierUniformLocation = sceneInstance.resolveCachedUniformLocation(targetCanvasContext, lookUpKey, shaderProgram, "uniform_brightnessMultiplier");
		targetCanvasContext.uniform1f(multiplierUniformLocation, multiplier);
	}
}

/**
 * Renders the static tiles which comprise the level
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 */
MainGingerManGameplayScene.prototype.renderLevelTiles = function(timeQuantum, targetCanvasContext) {
	this.setTextureRenderTarget(targetCanvasContext, this.backdropDynamicTextureFrameBuffer,
		this.backdropDynamicTexture, Constants.defaultCanvasWidth, Constants.defaultCanvasHeight);

	targetCanvasContext.clearColor(this.constCanvasClearColor.getRedValue(), this.constCanvasClearColor.getGreenValue(),
		this.constCanvasClearColor.getBlueValue(), this.constCanvasClearColor.getAlphaValue());
	targetCanvasContext.colorMask(true, true, true, true);
	targetCanvasContext.clear(targetCanvasContext.COLOR_BUFFER_BIT | targetCanvasContext.DEPTH_BUFFER_BIT);
	this.renderLevelTilesForLevelRep(timeQuantum, targetCanvasContext, this.currentBackdropLevelRepresentation, 0.7, 7);

	this.setTextureRenderTarget(targetCanvasContext, null, null, null, null);

	this.renderBackdropLevelRepTexture (timeQuantum, targetCanvasContext)
	this.renderLevelTilesForLevelRep(timeQuantum, targetCanvasContext, this.currentLevelRepresentation, 0.0, 1);
}

/**
 * Renders the static tiles associated with a particular level
 *  instance representation
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 * @param levelRepresentation {LevelRepresentation} Data which represents a self-contained
 *                                                  level
 * @param zOffset {number} Central Z coordinate at which the level tiles will be
 *                         rendered
 * @param overRender {number} Level tile count that will be used to extend the level
 *                            tiles rendering, along both the horizontal and
 *                            vertical axes (along both the start and the end of
 *                            axes)
 */
MainGingerManGameplayScene.prototype.renderLevelTilesForLevelRep = function(timeQuantum, targetCanvasContext,
	levelRepresentation, zOffset, overRender
) {
	if ((levelRepresentation !== null) && (this.levelScrollManager !== null)) {		
		var tileRenderWebGlData = WebGlUtility.objectRenderWebGlDataFromWebGlBufferData(
			this.webGlBufferDataLevelTileCube, this.shaderDarkeningGouraudTexture);

		var attributeLocationData = this.getStandardShaderWebGlAttributeLocations(true);
		var attributeData = this.getDefaultWebGlAttributeData();

		var renderSpaceVisibleRect = this.levelScrollManager.scrollSpaceVisibleRect()
				
		var levelSpaceVisibleRect = levelRepresentation.getVisibleTileRegionTileIndexGridRect(
			-this.levelScrollManager.viewPortCenterPointX,
			-this.levelScrollManager.viewPortCenterPointY);
			
		var startRowIndex = Math.floor(levelSpaceVisibleRect.top - levelSpaceVisibleRect.height) - 1;
		var startColumnIndex = Math.floor(levelSpaceVisibleRect.left) - 1;

		var resolvedOverRender = Utility.returnValidNumOrZero(overRender);
		var totalOverRender = 2 * resolvedOverRender;

		for (var rowIndex = startRowIndex - resolvedOverRender; rowIndex < (startRowIndex + levelSpaceVisibleRect.getHeight() + 2 + totalOverRender); rowIndex++) {
			for (var columnIndex = startColumnIndex - resolvedOverRender; columnIndex < (startColumnIndex + levelSpaceVisibleRect.getWidth() + 2 + totalOverRender); columnIndex++) {
				
				if ((rowIndex >= 0) && (columnIndex >= 0) &&
					(rowIndex < levelRepresentation.getTileGridHeight()) &&
					(columnIndex < levelRepresentation.getTileGridWidth())) {
					var tileAttributes = levelRepresentation.getTileAttributesForTileAtPosition(rowIndex, columnIndex);
					
					if ((tileAttributes != null) && (this.doTileAttributesRepresentPhysicialTile(tileAttributes))){
						// Level tiles are scaled such that each tile is scaled to
						// the appropriate render-space size.
						
						var offsetPoint = this.renderSpacePositionToTranslatedRenderSpacePosition(0.0, 0.0,
							Utility.returnValidNumOrZero(zOffset))
						var offsetX = -this.levelScrollManager.viewPortCenterPointX;
						var offsetY = -this.levelScrollManager.viewPortCenterPointY;
						var renderSpaceTileRect = levelRepresentation.getTileRectInLevelSpace(rowIndex, columnIndex,
							offsetPoint.xCoord, offsetPoint.yCoord);

						var tileTexture = null;
						if (Utility.validateVar(tileAttributes.builtInTexture)) {
							tileTexture = globalResources.textureKeyValueStore[tileAttributes.builtInTexture];
							var useDarkeningOscillation = Utility.returnValidNumOrZero(tileAttributes.contactDamage) > 0.0;
							
							if (tileTexture != null) {
								this.renderLevelTile(timeQuantum, targetCanvasContext, tileRenderWebGlData,
									renderSpaceTileRect, Utility.returnValidNumOrZero(zOffset), tileTexture,
									attributeLocationData, attributeData, useDarkeningOscillation);
							}
						}
					}
				}
			}
		}
	}
}

/**
 * Renders the texture with contains the near background
 *  (static level structure)
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
*/
MainGingerManGameplayScene.prototype.renderBackdropLevelRepTexture = function(timeQuantum, targetCanvasContext) {
	var attributeLocationData = this.getStandardShaderWebGlAttributeLocations(true);
	var attributeData = this.getDefaultWebGlAttributeData();

	var backdropLevelRenderWebGlData = WebGlUtility.objectRenderWebGlDataFromWebGlBufferData(
		this.webGlBufferDataKeyValStore[this.structuredBackdropLevelVertexBufferKey], this.shaderLevelRepBackdropRender);
	var webGlAttributeLocationData = this.getStandardShaderWebGlAttributeLocations(true);
	var webGlAttributeData = this.getDefaultWebGlAttributeData();	

	var transformationMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
		this.constTransformationMatrixColumnCount);
	transformationMatrix.setToIdentity();

	var textureOffsetX = ((this.levelScrollManager.viewPortCenterPointX) / 2.0) / this.constBackdropScrollRateDivisor;
	var textureOffsetY = ((this.levelScrollManager.viewPortCenterPointY) / 2.0) / this.constBackdropScrollRateDivisor;
	var textureSize = [Constants.defaultCanvasWidth, Constants.defaultCanvasHeight];
	function textureCoordOffsetUniformSetup(shaderProgram) {		
		var textureDimensionsUniformLocation = targetCanvasContext.getUniformLocation(shaderProgram, "vTextureDimensions");
		targetCanvasContext.uniform2iv(textureDimensionsUniformLocation, new Int32Array(textureSize));
		var usePremultipliedAlphaUniformLocation = targetCanvasContext.getUniformLocation(shaderProgram, "uniform_usePremultipliedAlphaFlag");
		targetCanvasContext.uniform1f(usePremultipliedAlphaUniformLocation, 1.0);
	}
	
	WebGlUtility.renderGeometry(backdropLevelRenderWebGlData, transformationMatrix, transformationMatrix,
		this.backdropDynamicTexture, targetCanvasContext, webGlAttributeLocationData, webGlAttributeData,
		textureCoordOffsetUniformSetup);
}

/**
 * Generates a matrix that is used to situate the GingerMan protagonist
 *  within the rendered scene
 *
 * @return {MathExt.Matrix} Positioning matrix used to situate the Ginger Man
 *                          protagonist within the scene
 */
MainGingerManGameplayScene.prototype.generateGingerManProtagonistPositioningMatrix = function() {
	var renderSpacePosition = this.worldSpacePositionToTranslatedRenderSpacePosition(
		this.currentWorldSpacePositionInLevel.xCoord,
		this.currentWorldSpacePositionInLevel.yCoord,
		this.currentWorldSpacePositionInLevel.zCoord);

	var renderSpaceTranslationMatrix = MathUtility.generateTranslationMatrix3d(
		renderSpacePosition.xCoord, renderSpacePosition.yCoord, renderSpacePosition.zCoord);

	var finalPositioningMatrix = renderSpaceTranslationMatrix;

	return finalPositioningMatrix;
}

/**
 * Renders the final representation of the Ginger Man protagonist
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 */
MainGingerManGameplayScene.prototype.renderGingerManProtagonist = function(timeQuantum, targetCanvasContext) {
	if (this.shouldRenderGingerManProtagonist()) {
		var webGlAttributeLocationData = this.getStandardShaderWebGlAttributeLocations(false);
		var webGlAttributeData = this.getDefaultWebGlAttributeData();

		var webGlBufferData = this.webGlBufferDataKeyValStore[this.keyModelGingerBreadMan];
		gingerManProtagonistWebGlData = WebGlUtility.objectRenderWebGlDataFromWebGlBufferData(
			webGlBufferData, this.shaderEdgeRotationSkinning);

		var baseTransformationMatrix = this.modelMatrixKeyValStore[this.keyModelGingerBreadMan];

		var compositeBaseTransformationMatrix = baseTransformationMatrix;
		if (this.getCurrentGingerManProtagonistModelDirectionBias() < 0) {
			var constDirectionReverseRotationMatrix = MathUtility.generateRotationMatrix3dAxisZ(Math.PI);
			compositeBaseTransformationMatrix = baseTransformationMatrix.multiply(constDirectionReverseRotationMatrix);
		}
		else {
			compositeBaseTransformationMatrix = baseTransformationMatrix;
		}

		var renderSpaceTranslationMatrix = this.generateGingerManProtagonistPositioningMatrix();
				
		var finalTransformationMatrix = renderSpaceTranslationMatrix.multiply(compositeBaseTransformationMatrix);

		WebGlUtility.renderGeometry(gingerManProtagonistWebGlData, finalTransformationMatrix,
			this.perspectiveMatrix(), null, targetCanvasContext, webGlAttributeLocationData,
			webGlAttributeData, this.edgeRotationSkinningUniformSetupFunction(targetCanvasContext, "GingerMan", this));
	}
}

/**
 * Function used to apply shader uniform values when rendering
 *  the Ginger Man protagonist (passed to WebGlUtility#renderGeometry)
 */
MainGingerManGameplayScene.prototype.edgeRotationSkinningUniformSetupFunction = function(targetCanvasContext, lookUpKey, sceneInstance) {
	return function (shaderProgram) {
		var edgeRotationAngleUniformLocation = WebGlUtility.getUniformLocation(targetCanvasContext,
			shaderProgram, "uniform_edgeRotationAngle", null);
		var edgeRotationCenterOffsetUniform = WebGlUtility.getUniformLocation(targetCanvasContext,
			shaderProgram, "uniform_edgeRotationCenterOffset", null);
		var referenceWidthUniformLocation = WebGlUtility.getUniformLocation(targetCanvasContext,
			shaderProgram, "uniform_referenceWidth", null);
		var modifierCurveExponentUniformLocation = WebGlUtility.getUniformLocation(targetCanvasContext,
			shaderProgram, "uniform_modifierCurveExponent", null);
		var modifierCurveCoefficientUniformLocation = WebGlUtility.getUniformLocation(targetCanvasContext,
			shaderProgram, "uniform_modifierCurveCoefficient", null);
		var warpCoefficientUniformLocation = WebGlUtility.getUniformLocation(targetCanvasContext,
			shaderProgram, "uniform_warpCoefficient", null);
		var heightUniformLocation = WebGlUtility.getUniformLocation(targetCanvasContext,
			shaderProgram, "uniform_height", null);
		var flatteningCoefficientLocation = WebGlUtility.getUniformLocation(targetCanvasContext,
			shaderProgram, "uniform_flatteningCoefficient", null);
		var deteriorationFactorLocation = WebGlUtility.getUniformLocation(targetCanvasContext,
			shaderProgram, "uniform_deteriorationFactor", null);			
			

		var protagonistIsFloating = !sceneInstance.isGingerManProtagonistInContactWithHorizSurface() && !sceneInstance.gameState.isInGameOverState();
		var floatingProtagonistEdgeRotationAngle = Math.PI / 11.0;
		var maxAmbulationEdgeRotationAngle = Math.PI / 15.0;

		var animationTimeReference = sceneInstance.gameState.isInActiveOperationState() ? sceneInstance.totalElapsedSceneTimeMs / 230.0 : 0.0
		var edgeRotationAngle = (sceneInstance.currentGingerManProtagonistAmbulationAccelerationAxisX != 0.0) && !protagonistIsFloating
			? maxAmbulationEdgeRotationAngle * Math.sin(animationTimeReference)
			: protagonistIsFloating ? floatingProtagonistEdgeRotationAngle : 0.0;

		targetCanvasContext.uniform1f(edgeRotationAngleUniformLocation, edgeRotationAngle *
			sceneInstance.currentGingerManProtagonistStaticModelDirectionBias);
		targetCanvasContext.uniform1f(edgeRotationCenterOffsetUniform, sceneInstance.modelRefDimensionKeyValStore[sceneInstance.keyModelGingerBreadMan].dimensionZ / 3.0);
		targetCanvasContext.uniform1f(referenceWidthUniformLocation,
			sceneInstance.modelRefDimensionKeyValStore[sceneInstance.keyModelGingerBreadMan].dimensionX * 0.9);
		targetCanvasContext.uniform1f(modifierCurveExponentUniformLocation, 3.0);
		targetCanvasContext.uniform1f(modifierCurveCoefficientUniformLocation, 1.0);
		targetCanvasContext.uniform1f(warpCoefficientUniformLocation, sceneInstance.gingerManProtagonistDamageAnimationSkewCoefficient());
		targetCanvasContext.uniform1f(heightUniformLocation, sceneInstance.modelRefDimensionKeyValStore[sceneInstance.keyModelGingerBreadMan].dimensionZ);
		targetCanvasContext.uniform1f(flatteningCoefficientLocation, sceneInstance.flatteningCoefficient());
		targetCanvasContext.uniform1f(deteriorationFactorLocation, sceneInstance.deteriorationFactor());
		
	}
}

/**
 * Renders all dynamic element instances, with the
 *  exception of the Ginger Man protagonist
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 */
MainGingerManGameplayScene.prototype.renderDynamicElements = function(timeQuantum, targetCanvasContext) {
	this.renderDynamicElementCollection(timeQuantum, targetCanvasContext, this.goalItemInstanceDataCollection,
		this.goalRotationMatrix());
	this.renderDynamicElementCollection(timeQuantum, targetCanvasContext, this.powerUpItemInstanceDataCollection,
		this.powerUpRotationMatrix());
	this.renderDynamicElementCollection(timeQuantum, targetCanvasContext, this.enemyInstanceDataCollection, null, true);
}

/**
 * Returns the current rotation matrix associated with
 *  a power-up item
 *
 * return {MathExt.Matrix} Matrix used to continuously transform the
 *                         power-up item
 */
MainGingerManGameplayScene.prototype.powerUpRotationMatrix = function () {
		return MathUtility.generateRotationMatrix3dAxisY(this.powerUpItemRotationRate * this.totalElapsedSceneTimeMs);
}

/**
 * Returns the current rotation matrix associated with a
 *  goal item
 *
 * return {MathExt.Matrix} Matrix used to continuously transform the
 *                         goal item
 */
MainGingerManGameplayScene.prototype.goalRotationMatrix = function () {
		return MathUtility.generateRotationMatrix3dAxisY(this.goalItemRotationRate * this.totalElapsedSceneTimeMs);
}

/**
 * Renders a single dynamic element/enemy
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 * @param alternateTransformationMatrix {MathExt.Matrix} Optional - an alternate matrix that will serve
 *                                                       as the base transformation matrix, as
 *                                                       opposed to the pre-determined base
 *                                                       transformation matrix within the internal
 *                                                       model base transformation matrix key-value
 *                                                       store (can be used to apply customized
 *                                                       element orientation)
 */
MainGingerManGameplayScene.prototype.renderDynamicElement = function (element, targetCanvasContext, alternateTransformationMatrix,
	applyHorizDirectionBiasTransform
) {
	if (Utility.validateVar(element)) {
		var webGlAttributeLocationData = this.getStandardShaderWebGlAttributeLocations(false);		
		var webGlAttributeData = this.getDefaultWebGlAttributeData();
		var webGlBufferData = this.webGlBufferDataKeyValStore[element.modelDataKey];
		var elementWebGlData = WebGlUtility.objectRenderWebGlDataFromWebGlBufferData(
			webGlBufferData, this.shaderStandardObject);

		var componentTransformationMatrix = Utility.validateVar(alternateTransformationMatrix) ?
			alternateTransformationMatrix : this.modelMatrixKeyValStore[element.modelDataKey];

		var directionBiasTransformationMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
			this.constTransformationMatrixColumnCount);
		directionBiasTransformationMatrix.setToIdentity();
		if (Utility.validateVar(applyHorizDirectionBiasTransform) && applyHorizDirectionBiasTransform) {
			directionBiasTransformationMatrix = this.horizDirectionBiasMatrixFromDynamicElement(
				element);
		}
	
		var renderSpacePosition = this.worldSpacePositionToTranslatedRenderSpacePosition(
			element.modelWorldSpacePosition.xCoord,
			element.modelWorldSpacePosition.yCoord,
			element.modelWorldSpacePosition.zCoord);

		var finalTransformationMatrix = MathUtility.generateTranslationMatrix3d(
			renderSpacePosition.xCoord, renderSpacePosition.yCoord, renderSpacePosition.zCoord);
			
		if (Utility.validateVar(componentTransformationMatrix)) {
			finalTransformationMatrix = finalTransformationMatrix.multiply(
				directionBiasTransformationMatrix.multiply(componentTransformationMatrix));
		}
	
		WebGlUtility.renderGeometry(elementWebGlData, finalTransformationMatrix, this.perspectiveMatrix(), null,
			targetCanvasContext, webGlAttributeLocationData, webGlAttributeData);
	}	
}

/**
 * @param dynamicElement {DynamicItemInstanceData} Data representing a dynamnic element
 *                                                 instance (e.g., enemy) within the
 *                                                 gameplay scene
 *
 * return {MathExt.Matrix} Matrix used to alter the orientation
 *                         of a rendered dynamic object model
 *                         in compliance with the current
 *                         direction bias
 */
MainGingerManGameplayScene.prototype.horizDirectionBiasMatrixFromDynamicElement = function (dynamicElement) {
	var rotationMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
		this.constTransformationMatrixColumnCount);
	rotationMatrix.setToIdentity();

	if (Utility.validateVar(dynamicElement)) {
		var rotationAngleAxisY = Math.PI / 2.0;
		
		if (this.worldSpaceCoordAxisValuesAreCoincident(dynamicElement.velocityVector.xComponent, 0.0)) {
			rotationAngleAxisY = 0.0;
		}
		else if (dynamicElement.velocityVector.xComponent < 0.0) {
			rotationAngleAxisY *= -1.0;
		}
		
		rotationMatrix = MathUtility.generateRotationMatrix3dAxisY(rotationAngleAxisY);
	}

	return rotationMatrix;
}


/**
 * Renders collection of dynamic level elements
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 * @param elementCollection {Array} Collection of DynamicItemInstanceData/EnemyInstanceData objects
 *                                  which represent dynamic elements to be rendered
 * @param alternateTransformationMatrix {MathExt.Matrix} Optional - an alternate matrix that will serve
 *                                                       as the base transformation matrix, as
 *                                                       opposed to the pre-determined base
 *                                                       transformation matrix within the internal
 *                                                       model base transformation matrix key-value
 *                                                       store (can be used to apply customized
 *                                                       element orientation)
 */
MainGingerManGameplayScene.prototype.renderDynamicElementCollection = function(timeQuantum, targetCanvasContext,
	elementCollection, alternateBaseTransformationMatrix, applyHorizDirectionBiasTransform) {
		
	if (Utility.validateVar(timeQuantum) && Utility.validateVar(targetCanvasContext) &&
		Utility.validateVar(elementCollection)
	) {
		for (var currentElement of elementCollection) {
			this.renderDynamicElement(currentElement, targetCanvasContext, alternateBaseTransformationMatrix,
				applyHorizDirectionBiasTransform);
		}			
	}	
}

/**
 * Function used to set shader uniform values for point light evaluation
 *
 * @param sceneInstance {MainGingerManGameplayScene} Reference to the game
 *                                                        implementation instance
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 *
 * @see WebGlUtility.renderGeometry
 */
MainGingerManGameplayScene.prototype.pointLightUniformSetupFunction = function (targetCanvasContext, lookUpKey, sceneInstance) {
	var pointLightHeight = this.constScaleFactorDefaultGingerManProtagonist;
	var pointLightContribution = this.currentLevelRepresentation.guideLightIntensity;
	return function (shaderProgram) {
		
		//var pointLightContributionFractionUniform = targetCanvasContext.getUniformLocation(shaderProgram, "uniform_pointLightContributionFraction");
		var pointLightContributionFractionUniform = sceneInstance.resolveCachedUniformLocation(targetCanvasContext, lookUpKey, shaderProgram, "uniform_pointLightContributionFraction");
		targetCanvasContext.uniform1f(pointLightContributionFractionUniform, pointLightContribution);
		
		var pointLightColor = sceneInstance.gingerManProtagonistGuideLightColor();
		//var pointLightColorUniformLocation = targetCanvasContext.getUniformLocation(shaderProgram, "uniform_pointLightColor");
		var pointLightColorUniformLocation = sceneInstance.resolveCachedUniformLocation(targetCanvasContext, lookUpKey, shaderProgram, "uniform_pointLightColor");
		targetCanvasContext.uniform4fv(pointLightColorUniformLocation, [pointLightColor.getRedValue(),
			pointLightColor.getGreenValue(), pointLightColor.getBlueValue(), pointLightColor.getAlphaValue()]);

		// Position the point light at the world-space location of the GingerMan protagonist,
		// using the base protagonist height (height of the torso section). Otherwise,
		// the point light will not be properly cast onto the ground plane.
		var pointLightRenderSpaceLocation = sceneInstance.worldSpacePositionToTranslatedRenderSpacePosition(
			sceneInstance.currentWorldSpacePositionInLevel.xCoord,
			sceneInstance.currentWorldSpacePositionInLevel.yCoord,
			pointLightHeight);
		//var pointLightLocationUniformLocation = targetCanvasContext.getUniformLocation(shaderProgram, "uniform_pointLightPosition");
		var pointLightLocationUniformLocation = sceneInstance.resolveCachedUniformLocation(targetCanvasContext, lookUpKey, shaderProgram, "uniform_pointLightPosition");
		targetCanvasContext.uniform3fv(pointLightLocationUniformLocation, [ pointLightRenderSpaceLocation.xCoord,
			pointLightRenderSpaceLocation.yCoord, pointLightRenderSpaceLocation.zCoord ]);
	}	
}

/**
 * Performs a shader uniform location look-up, caching the result,
 *  and returning the result on subsequent invocations.
 *
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 * @param lookUpKey {String} A key that will be used to uniquely associate
 *                           the uniform with the shader
 * @param shaderProgram {WebGLShader} The shader program on which the look-up
 *                                    will be performed if it is not contained
 *                                    within the cache
 * @param uniformName {String} The name of the uniform to look-up
 *
 * @return {WebGLUniformLocation} A WebGL uniform location
 */
MainGingerManGameplayScene.prototype.resolveCachedUniformLocation = function(targetCanvasContext, lookUpKey, shaderProgram, uniformName) {
	var uniformLocation = null;
	
	if (!Utility.validateVar(this.uniformLocationCache[lookUpKey])) {
		this.uniformLocationCache[lookUpKey] = {};
	}
	
	uniformLocation = this.uniformLocationCache[lookUpKey][uniformName];
	
	if (!Utility.validateVar(uniformLocation)) {
		var uniformLocation = targetCanvasContext.getUniformLocation(shaderProgram, uniformName);
		this.uniformLocationCache[lookUpKey][uniformName] = uniformLocation;
	}
	
	return uniformLocation;
}


/**
 * Renders all game overlays
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 */
MainGingerManGameplayScene.prototype.renderOverlayBitmaps = function(timeQuantum, targetCanvasContext) {
	this.renderOverlayScrim(timeQuantum, targetCanvasContext);
	this.renderSpiritMeterOverlay(timeQuantum, targetCanvasContext);
	this.renderSpiritMeterLabelOverlay(timeQuantum, targetCanvasContext);
	this.renderGoalStatusOverlay(timeQuantum, targetCanvasContext);
	this.renderGameEndOverlay(timeQuantum, targetCanvasContext);
	this.renderGameCompletionOverlay(timeQuantum, targetCanvasContext);	
	this.renderFadeOverlay(timeQuantum, targetCanvasContext);
}

/**
 * Renders the primary, texture-based portion of the scene
 * @param timeQuantum {number} Time delta with respect to the previously-executed
 *                             animation step (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 */
MainGingerManGameplayScene.prototype.renderScene = function(timeQuantum, targetCanvasContext) {	
	var sceneInstance = this;
	
	targetCanvasContext.colorMask(true, true, true, true);
	targetCanvasContext.clear(targetCanvasContext.COLOR_BUFFER_BIT);

	this.setTextureRenderTarget(targetCanvasContext, null, null, null, null);
	sceneInstance.renderBackdrop(timeQuantum, targetCanvasContext);
	sceneInstance.renderLevelTiles(timeQuantum, targetCanvasContext);
	sceneInstance.renderGingerManProtagonist(timeQuantum, targetCanvasContext);
	sceneInstance.renderDynamicElements(timeQuantum, targetCanvasContext);
	sceneInstance.renderOverlayBitmaps(timeQuantum, targetCanvasContext);
}

/**
 * Executes a time-parameterized single scene animation step
 * @param timeQuantum {number} Time delta with respect to the previously-executed
 *                             animation step (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            the scene data will be drawn
 */
MainGingerManGameplayScene.prototype.executeStep = function(timeQuantum, targetCanvasContext) {
	// Game state changes are dependent upon successively
	// performing evaluations using time quanta. If a time quantum
	// is unusually large, anomalous game state behavior may
	// occur (e.g., evaluation of excessively-high computed
	// velocities). Limit the reported time quantum magnitude.
	var effectiveTimeQuantum = Math.min(this.maxExpressibleTimeQuantum, timeQuantum);
	
	this.renderScene(effectiveTimeQuantum, targetCanvasContext);
	this.updateStateInformationForWorldObjects(timeQuantum);
	this.evaluateCollisions();
	this.updateStateInformationForLevel(timeQuantum);
	this.updateGameState(timeQuantum);

	this.totalElapsedSceneTimeMs += timeQuantum;
}