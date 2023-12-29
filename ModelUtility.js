/**
 * Stores dimensions for models
 *  (render-space coordinates)
 */
function ModelDimensions() {
	this.dimensionX = 0.0;
	this.dimensionY = 0.0;
	this.dimensionZ = 0.0;
}

var ModelUtility = {}

ModelUtility.prepareModelRenderDataFromObjBuffer = function(canvasContext, scaleFactor, objBufferSource, vertexSize, dimensionKeyValStore,
	storeKey) {

	if (Utility.validateVar(canvasContext)) {
		vertexDefProcessorBoundsNormalizer = new ObjFormatBufferParserUtility.ObjVertexDefProcessorObjectBoundsNormalizer()
		vertexDefProcessorBoundsNormalizer.unitScalingFactor = scaleFactor;
		
		var modelVertexData = ObjFormatBufferParserUtility.generateModelVertexDataFromObjBuffer(objBufferSource,
			vertexDefProcessorBoundsNormalizer, null, null);
		
		if (Utility.validateVar(dimensionKeyValStore)) {
			dimensionKeyValStore[storeKey] = ModelUtility.modelDimensionsFromModelVertexData(modelVertexData);
		}
		
		return WebGlUtility.createWebGlBufferDataFromAggregateVertexData(canvasContext,
			modelVertexData.aggregateVertexData, vertexSize);
	}
}

/**
 * Determines the dimensions of a render-space bounding cube that is
 *  derived from a provided set of vertices.
 *
 * @param modelVertexData {ObjFormatBufferParserUtility.ModelVertexDataContainer} Object which encapsulates a
 *                                                                                collection of vertices
 */
ModelUtility.modelDimensionsFromModelVertexData = function(modelVertexData) {
	var modelDimensions = new ModelDimensions();
		
	if (Utility.validateVarAgainstType(modelVertexData, ObjFormatBufferParserUtility.ModelVertexDataContainer)) {	
		modelDimensions.dimensionX = modelVertexData.modelDimensionX;
		modelDimensions.dimensionY = modelVertexData.modelDimensionY;
		modelDimensions.dimensionZ = modelVertexData.modelDimensionZ;
	}
	
	return modelDimensions;
}