// SceneExecution.js - Responsible for continuously executing a single scene animation
// Author: Ayodeji Oshinnaiye


function sceneExecution(targetScene) {
    if (Utility.validateVar(targetScene)) {

		var executionPaused = false;

		// Time, in milliseconds, since the execution of the last scene
		// animation single-step (permits animation to accommodate for
		// slower machines).
		var timeSinceLastSceneStep = 0;	

		// Last absolute date/time (milliseconds) at which a scene
		// step execution was invoked.
		var lastSceneStepTimeAbs = 0;

		function initializeScene(targetScene) {
			if (Utility.validateVar(targetScene)) {
				// Initialize the scene, invoking
				// the stepwise execution process
				// immediately after initialization.
				targetScene.initialize(runSegmentStep);
			}			
		}

		/**
		 * Executes a single scene step
		 * @return True if the segment should continue execution,
		 *         false otherwise
		 */
		function runSegmentStep(currentTimeMs) {
			if (!executionPaused) {
				// Use the system clock to keep track of the
				// execution period.
				if (lastSceneStepTimeAbs > 0) {
					timeSinceLastSceneStep = currentTimeMs - lastSceneStepTimeAbs;
					lastSceneStepTimeAbs = currentTimeMs;
				}

				lastSceneStepTimeAbs = currentTimeMs;
				var startClock = new Date();

				// Execute a scene step, using the actual time interval
				// between scene executions as a time quantum.
				var targetCanvasContext = globalResources.getMainCanvasContext();
				if (targetCanvasContext !== null) {
					targetScene.executeStep(timeSinceLastSceneStep, targetCanvasContext);
				}

				// Update the segment duration, and repeat
				// the scene step execution.
				var endClock = new Date();

				if (Utility.validateVar(startClock) && Utility.validateVar(endClock)) {
					// Frame timing for debugging purposes...
					var lastFrameTime = (endClock.getTime() - startClock.getTime());
				}
			}

			window.requestAnimationFrame(runSegmentStep);	
		}
		
		addEventListener("visibilitychange", (event) => {			
			executionPaused = (document.visibilityState !== "visible");
			if (executionPaused) {
				// If the output is no longer visible, pause execution,
				// as the output is not refreshed periodically,
				// which may result in anomalous behavior of logic
				// that is dependent upon refresh timing.
				timeSinceLastSceneStep = 0; 
				lastSceneStepTimeAbs = 0;
			}
		});
		
		// Begin the segment execution loop.
		initializeScene(targetScene);
	}
}
