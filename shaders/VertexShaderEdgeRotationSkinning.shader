// VertexShaderEdgeRotationSkinningShader.shader - Applies a transformation to vertices, using a
//                                                 supplied transformation matrix; also applied
//       									       color, normal, lighting and texture coordinate data.
//                                                 This shader was constructed for a particular model,
//                                                 which has its Z-axis oriented in the expected orientation
//                                                 of the Y-axis - alterations must be performed if this
//                                                 shader is to be used in a generalized manner.
//
// Author: Ayodeji Oshinnaiye

attribute vec4 aVertexPosition;
attribute vec4 aVertexColor;
attribute vec3 aVertexNormal;
uniform mediump vec3 uniform_ambientLightVector;
attribute vec2 aTextureCoord;

varying mediump vec2 vTextureCoord;
varying lowp vec4 vBaseFragmentColor;
varying mediump vec3 vNormalVector;
varying mediump vec3 vPosition;

uniform mat4 uniform_transformationMatrix;
uniform mat4 uniform_projectionMatrix;
uniform highp float uniform_edgeRotationAngle;
uniform highp float uniform_edgeRotationCenterOffset;
uniform highp float uniform_referenceWidth;
uniform highp float uniform_modifierCurveExponent;
uniform highp float uniform_modifierCurveCoefficient;
uniform highp float uniform_warpCoefficient;
uniform highp float uniform_height;
uniform highp float uniform_flatteningCoefficient;

const mat4 identityMatrix =
	mat4(1.0, 0.0, 0.0, 0.0,
		 0.0, 1.0, 0.0, 0.0,
		 0.0, 0.0, 1.0, 0.0,
		 0.0, 0.0, 0.0, 1.0);

void main() {
	// The distance center fraction is used to blend the limb swing
	// animation from the centerline to the extremities, as a function
	// of the distance along the frontal plane (limb swing should
	// be zero at the center, with an inflection point at the center.
	highp float distanceFromCenterFraction = aVertexPosition.x / (uniform_referenceWidth / 3.0);
	highp float distanceFromCenterFractionAbs = abs(distanceFromCenterFraction);
	
	// The angle modifier implements the limb swing blend along the frontal
	// plane. The blending (with zero-crossing inflection points) occurs
	// in both the horizontal an the vertical planes.
	highp float upperLowerExtremityCounterSwingBlend = (step(0.02, aVertexPosition.z) - 0.5) * 2.0 * pow(16.0 * (aVertexPosition.z - 0.04), 2.0);
	// The pow(x, 3.0) produces odd results on MacOS (and possibly iOS) platforms
	highp float angleModifier = distanceFromCenterFraction * distanceFromCenterFraction * distanceFromCenterFraction * upperLowerExtremityCounterSwingBlend;     //uniform_modifierCurveCoefficient * pow(distanceFromCenterFraction, 3.0) *

	
	// Rotation matrix applied to in order to perform extremity rotation.
	highp float finalRotationAngle = angleModifier * uniform_edgeRotationAngle;
	mat4 edgeRotationMatrix = mat4(
		1.0,						0.0,									0.0,								0.0,
		0.0,						cos(finalRotationAngle), 				sin(finalRotationAngle),			0.0,
		0.0,						-sin(finalRotationAngle), 				cos(finalRotationAngle),			0.0,
		0.0, 						0.0, 									0.0,								1.0);

	float bottom = uniform_height / 2.0;
	float skewUnitMagnitude = (-aVertexPosition.z + bottom) / uniform_height;
	float finalSkewUnitMagnitude = pow(skewUnitMagnitude, 2.0) * uniform_warpCoefficient;
	float flatteningWidthMultiplier = pow(1.0 - (-aVertexPosition.z + bottom) / uniform_height, 2.0);
	float flatteningScaleFactor = 1.0 + uniform_flatteningCoefficient * flatteningWidthMultiplier;
	float flatteningHeightScaleFactor = 1.0 / max(uniform_flatteningCoefficient / 2.0, 1.0);
	float flatteningVerticalShift = (uniform_height - flatteningHeightScaleFactor * uniform_height) / 2.0;

	mat4 flatteningMatrix = mat4(
		1.0,						0.0, 							0.0,							0.0,
		0.0,						flatteningScaleFactor, 			0.0,							0.0,
		0.0,						0.0, 							flatteningHeightScaleFactor,	flatteningVerticalShift,
		0.0,						0.0,							0.0,							1.0);	

	// Skew matrix used to indicate damage
	mat4 skewTranslationMatrix = mat4(
		1.0,						0.0, 							0.0,							finalSkewUnitMagnitude,
		0.0,						1.0, 							0.0,							0.0,
		0.0,						0.0, 							1.0,							0.0,
		0.0,						0.0,							0.0,							1.0);

	// Translation matrix applied before extremity rotation (the end of an arm
	// is located centrally with respect to a body - if a translation is not performed,
	// the rotation center point will be evaluated at the hand)
	mat4 rotationCenterTranslationMatrix = mat4(
		1.0,						0.0, 							0.0,							0.0,
		0.0,						1.0, 							0.0,							0.0,
		0.0,						0.0, 							1.0,							uniform_edgeRotationCenterOffset,
		0.0,						0.0,							0.0,							1.0);	

	// Translation matrix applied to restore the position of the body for
	// susequent transformation
	mat4 postRotationTranslationMatrix = mat4(
		1.0,						0.0, 							0.0,							0.0,
		0.0,						1.0, 							0.0,							0.0,
		0.0,						0.0, 							1.0,							-uniform_edgeRotationCenterOffset,
		0.0,						0.0,							0.0,							1.0);	

	/*mat4 edgeRotationMatrix = mat4(
		cos(finalRotationAngle),	0.0, 									-sin(finalRotationAngle),			0.0,
		0.0,						1.0, 									0.0,								0.0,
		sin(finalRotationAngle),	0.0, 									cos(finalRotationAngle),			0.0,
		0.0,						0.0,									0.0,								1.0);*/

	/*mat4 edgeRotationMatrix = mat4(
		cos(finalRotationAngle),	sin(finalRotationAngle),				0.0,								0.0,
		-sin(finalRotationAngle),	cos(finalRotationAngle), 				0.0,								0.0,
		0.0,						0.0, 									1.0,								0.0,
		0.0,						0.0,									0.0,								1.0);*/

	mat4 interpolatedEdgeRotationMatrix = edgeRotationMatrix;//(identityMatrix * (1.0 - distanceFromCenterFractionAbs)) + (edgeRotationMatrix * distanceFromCenterFractionAbs);
	vec4 finalPosition = vec4(aVertexPosition.xyz, 1.0);
	
	mat4 finalTransformationMatrix = rotationCenterTranslationMatrix * interpolatedEdgeRotationMatrix * postRotationTranslationMatrix *
		flatteningMatrix * uniform_transformationMatrix * skewTranslationMatrix * uniform_projectionMatrix;

	gl_Position = vec4(aVertexPosition.xyz, 1.0) * finalTransformationMatrix;	

		
	vTextureCoord = aTextureCoord;
	vBaseFragmentColor = aVertexColor;
	vNormalVector = aVertexNormal * mat3(uniform_transformationMatrix);
	vPosition = finalPosition.xyz;
}
