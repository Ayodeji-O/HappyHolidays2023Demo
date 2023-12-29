var WorldRepresentationUtility = {};

/**
 * Converts a value, represented in render-space units, to world-space units
 *  (meters)
 *
 * @param renderSpaceLength {Number} Render-space length specification
 * @param worldScale {Number}
 *
 * @return {Number} World-space length specification (meters)
 */
WorldRepresentationUtility.renderSpaceLengthToWorldSpaceLength = function (renderSpaceLength, worldScale) {
	return Utility.returnValidNumOrZero(renderSpaceLength) / worldScale;
}

/**
 * Converts a value, represented in world-space units, to render-space units
 *  (meters)
 *
 * @param worldSpaceLength {Number} World-space length specification
 *
 * @return {Number} Render-space length specification
 */
WorldRepresentationUtility.worldSpaceLengthToRenderSpaceLength = function (worldSpaceLength, worldScale) {
	return Utility.returnValidNumOrZero(worldSpaceLength) * worldScale;
}

/**
 * Converts a position in three-dimensional render space (meters) to world-space
 *  units
 *
 * @param coordX {Number} X-axis position
 * @param coordY {Number} Y-axis position
 * @param coordZ {Number} Z-axis position
 *
 * @return {Point3d} A position in world space
 */
WorldRepresentationUtility.renderSpacePositionToWorldSpacePosition = function (coordX, coordY, coordZ, worldScale) {
	var renderSpacePoint = new Point3d(
		this.renderSpaceLengthToWorldSpaceLength(Utility.returnValidNumOrZero(coordX), worldScale),
		this.renderSpaceLengthToWorldSpaceLength(Utility.returnValidNumOrZero(coordY), worldScale),
		this.renderSpaceLengthToWorldSpaceLength(Utility.returnValidNumOrZero(coordZ), worldScale));
	
	return renderSpacePoint;	
}

/**
 * Converts a position in three-dimensional world space (meters) to render-space
 *  units
 *
 * @param coordX {Number} X-axis position
 * @param coordY {Number} Y-axis position
 * @param coordZ {Number} Z-axis position
 *
 * @return {Point3d} A position in render-space
 */
WorldRepresentationUtility.worldSpacePositionToRenderSpacePosition = function (coordX, coordY, coordZ, worldScale) {
	var renderSpacePoint = new Point3d(
		this.worldSpaceLengthToRenderSpaceLength(Utility.returnValidNumOrZero(coordX), worldScale),
		this.worldSpaceLengthToRenderSpaceLength(Utility.returnValidNumOrZero(coordY), worldScale),
		this.worldSpaceLengthToRenderSpaceLength(Utility.returnValidNumOrZero(coordZ), worldScale));
	
	return renderSpacePoint;
}

/**
 * Converts a position in three-dimensional world space (meters) to render-space
 *  units
 *
 * @param coordX {Number} X-axis position
 * @param coordY {Number} Y-axis position
 * @param coordZ {Number} Z-axis position
 *
 * @return {Point3d} A position in render-space
 */
WorldRepresentationUtility.renderSpaceRectToWorldSpaceRect = function (renderSpaceRect, worldScale) {
	var worldSpaceRect = new Rectangle(
		this.renderSpaceLengthToWorldSpaceLength(renderSpaceRect.left, worldScale),
		this.renderSpaceLengthToWorldSpaceLength(renderSpaceRect.top, worldScale),
		this.renderSpaceLengthToWorldSpaceLength(renderSpaceRect.width, worldScale),
		this.renderSpaceLengthToWorldSpaceLength(renderSpaceRect.height, worldScale));
	
	return worldSpaceRect;
}

/**
 * Converts a position in three-dimensional world space (meters) to render-space
 *  units
 *
 * @param coordX {Number} X-axis position
 * @param coordY {Number} Y-axis position
 * @param coordZ {Number} Z-axis position
 *
 * @return {Point3d} A position in render-space
 */
WorldRepresentationUtility.worldSpaceRectToRenderSpaceRect = function (worldSpaceRect, worldScale) {
	var renderSpaceRect = new Rectangle(
		this.worldSpaceLengthToRenderSpaceLength(worldSpaceRect.left, worldScale),
		this.worldSpaceLengthToRenderSpaceLength(worldSpaceRect.top, worldScale),
		this.worldSpaceLengthToRenderSpaceLength(worldSpaceRect.width, worldScale),
		this.worldSpaceLengthToRenderSpaceLength(worldSpaceRect.height, worldScale));
	
	return renderSpaceRect;
}