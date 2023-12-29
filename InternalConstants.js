// InternalConstants.js - Contains common constants used within various classes/routines
// Author: Ayodeji Oshinnaiye

var Constants = {
	/**
	 * When set to true, unit tests will always be
	 *  executed upon loading of the entry point
	 */
	runTestsAtProgramCommencement: false,
	
	/**
	 * Width of front buffer canvas (and associated
	 *  backbuffer canvases)
	 */
	defaultCanvasWidth : 960,
	
	/**
	 * Height of front buffer canvas (and associated
	 *  backbuffer canvases)
	 *
	 */
	defaultCanvasHeight : 720,
	
	/**
	 * Width of the internally-stored image bitmap
	 *  representation of each source image
	 */
	internalBitmapWidth : 1024,
	
	/**
	 * Height of the internally-stored image bitmap
	 *  representation of each source image
	 */
	internalBitmapHeight: 1024,
			
	/**
	 * Width of the texture that will be used as
	 *  an overlay with respect to the primary
	 *  image textures
	 */
	overlayTextureWidth: 960,
	
	/**
	 * Height of the texture that will be used as
	 *  an overlay with respect to the primary
	 *  image textures
	 */
	overlayTextureHeight: 48,
	
	/**
	 * Width of the texture that will be used as
	 *  a full-screen overlay with respect to the
	 *  primary image textures
	 */
	fullScreenOverlayTextureWidth: 960,

	/**
	 * Height of the texture that will be used as
	 *  a full-screen overlay with respect to the
	 *  primary image textures
	 */	
	fullScreenOverlayTextureHeight: 720,
	
	/**
	 * Width of the initially-displayed progress
	 *  bar/element
	 */
	progressElementWidth: 800,
	
	/**
	 * Number of milliseconds contained in one second
	 */
	millisecondsPerSecond : 1000,
	
	/**
	 * Maximum angular measurement, in degrees
	 */
	maxAngleDegrees : 360,
	
	/**
	 * Maximum value of a scalar input event
	 */
	maxScalarInputEventMagnitude : 1.0,
		
	/**
	 * Scalar input class of input events
	 */
	eventTypeScalarInput : "_InputTypeScalarInputEvent",
	
		/**
	 * Height of the "small" intro text font, in pixels
	 */	
	smallIntroFontSizePx: 14,
	
	/**
	 * Height of the "small" label font, in pixels
	 */
	smallLabelFontSizePx: 20,
	
	/**
	 * Height of the label font, in pixels
	 */
	labelFontSizePx: 30,
	
	/**
	 * Height of the "Game Over" text, in pixels
	 */
	gameOverFontSizePx: 120,
	
	/**
	 * Height of the "Congratulations" text, in pixels
	 */
	gameCompletedFontSizePx: 100,
	
	/**
	 * Size of the font for a button that is intended to be
	 *  a prominent UI element
	 */
	prominentButtonFontSize: 50,

	/**
	 * Alpha (transparency) value for the background of text regions
	 */
	defaultTextBackgroundUnitAlpha: 0.01,
	
	/**
	 * Intensity of the background for text regions
	 */
	defaultTextBackgroundUnitIntensity: 0.0,

	/**
	 * Font name of the label font
	 */
	labelFont: "Arial",
	
	/**
	 * Style applied to the label font
	 */
	labelFontStyle: "Italic",

	/**
	 * Protagonist vitality indicator label text
	 */
	stringVitalityLabel: "Freshness:",

	/**
	 * Intro text (1/2)
	 */
	stringIntroGeneral1: "Help Ginger Man find pieces for his new house!",

	/**
	 * Protagonist movement directions
	 */
	stringIntroMoveInstruction: "Use the arrow keys / tilt the device to move",

	/**
	 * Level goal description
	 */
	stringIntroGoalDesc: "Collect pieces required for home, sweet home",

	/**
	 * Vitality gauge description
	 */
	stringIntroEnhancementDesc: "Power-ups can sweeten the deal for a short time",

	/**
	 * Vitality gauge description
	 */
	stringIntroHazardDesc: "Hazards may cause your dreams to crumble",

	/**
	 * Vitality gauge description
	 */
	stringIntroVitalityGaugeDesc: "Ginger Man is best when fresh!",

	/**
	 * Demo initiation button text
	 */
	stringIntroClickToContinue: "Click / Tap to Begin!",
	
	/**
	 * Level retry directions
	 */
	stringSpaceTapToRetry: "(Space/Tap to Retry)",
	
	/**
	 * Text displayed after the game has concluded
	 */
	stringGameOver: "Game Over",
	
	/**
	 * Text displayed after the game has been successfully
	 *  completed in its entirety
	 */
	stringGameCompleted: "Congratulations!",

	/**
	 * Additional text displayed after successful
	 *  completion of the game
	 */
	stringGameCompletedDetail: "Ginger Man will spend The Holidays in his new home!",

	/**
	 * Holiday message text
	 */
	messageText: "Happy Holidays from Katie and Ayo!",
	/**
	 * Label for the game score
	 */
	stringGoalStatusLabel: "Pieces Found: ",
	
	/**
	 * Goal found portion separator
	 */
	stringGoalCountSeparator: " / ",	
}