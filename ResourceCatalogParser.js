// Author: Ayodeji Oshinnaiye
// Dependent upon:
//  -Utility.js

/**
 *	{
 *		"$schema": "https://json-schema.org/draft/2020-12/schema",
 *
 *		"description": "Specification of a resource with data that is accessible through a persistent store-type interface
 *		"type": "object",
 *		"properties": {
 *			"key":	{
 *				"description": "Unique identifier for the resource",
 *				"type": "string"
 *			},
 *			"uri":	{
 *				"description": "URI used to retrieve the resource data",
 *				"type": "string"
 *			},
 *			"resourceType": {
 *				"description": "URI used to retrieve the resource data",
 *				"type": "enum": [ "texture" ]
 *			},
 *			"binaryFlag": {
 *				"description": "Indicates whether or not the resource is binary data",
 *				"type": "boolean"
 *			}
 *		}
 *		"required": [
 *			"key",
 *			"uri"
 *		]		
 *	}
 */




function ResourceCatalogParser() {
}

ResourceCatalogParser.resourceTypeSpecifierTexture = "textureResource";
ResourceCatalogParser.resourceTypeSpecifierBackgroundAudio = "backgroundAudioResource";
ResourceCatalogParser.resourceTypeSpecifierGenericText = "genericTextResource";
ResourceCatalogParser.resourceTypeSpecifierGenericBinary = "genericBinaryResource";

ResourceCatalogParser.prototype.parseCataog = function(resourceCatalog) {
	var resourceSpecifications = null;

	if (Utility.validateVar(resourceCatalog)) {
		var parsedCatalog = JSON.parse(resourceCatalog);
		if ((parsedCatalog !== null) && (Utility.validateVarAgainstType(parsedCatalog.resourceCatalog, Array))) {
			resourceSpecifications = parsedCatalog.resourceCatalog;
		}
	}
	
	return resourceSpecifications;
}