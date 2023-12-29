// FragmentShaderStandardTexture.shader - Generic texture mapping
// shader.

// Author: Ayodeji Oshinnaiye

varying mediump vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform mediump float uniform_rippleFactor;

const mediump vec2 centerPoint = vec2(0.5, 0.5);
const mediump float maxDistance = distance(vec2(1.0, 1.0), centerPoint);
const mediump float constPi = asin(1.0);
const mediump float baseDistanceOffsetMagnitude = 0.2;
const mediump float baseRedDistanceOffsetMagnitude = baseDistanceOffsetMagnitude * 1.1;
const mediump float baseGreenDistanceOffsetMagnitude = baseDistanceOffsetMagnitude * 1.0;
const mediump float baseBlueDistanceOffsetMagnitude = baseDistanceOffsetMagnitude * 1.2;
const mediump float basePeriodMultiplier = 35.0;

mediump vec4 sampleWithOffsetFraction(mediump vec2 sourceTextureCoord, mediump float offsetFraction, mediump float distanceOffsetMagnitude) {
	mediump float clampedRippleFactor = clamp(uniform_rippleFactor, 0.0, 1.0);
	mediump float distanceFraction = clamp(
		(distance(sourceTextureCoord, centerPoint) / maxDistance) + offsetFraction, 0.0, 1.0);

	mediump float periodMultiplier = basePeriodMultiplier * clampedRippleFactor;
	mediump float resolvedDistanceOffsetMagnitude = distanceOffsetMagnitude * pow(clampedRippleFactor, 0.1);
	mediump float distanceOffset = resolvedDistanceOffsetMagnitude * (sin(distanceFraction * constPi * periodMultiplier) + 1.0) / 2.0;

	mediump vec2 adjustedTextureCoord = (normalize(sourceTextureCoord - centerPoint) * distanceOffset) + sourceTextureCoord;

	return texture2D(uSampler, adjustedTextureCoord);
}

void main() {
	const mediump float redOffset = 0.01;
	const mediump float greenOffset = 0.03;
	const mediump float blueOffset = 0.05;

	mediump vec4 redBlendedSample =
		(sampleWithOffsetFraction(vTextureCoord, 0.0, baseRedDistanceOffsetMagnitude) +
		sampleWithOffsetFraction(vTextureCoord, redOffset * 1.0, baseRedDistanceOffsetMagnitude) +
		sampleWithOffsetFraction(vTextureCoord, redOffset * 2.0, baseRedDistanceOffsetMagnitude) +
		sampleWithOffsetFraction(vTextureCoord, redOffset * 3.0, baseRedDistanceOffsetMagnitude) +
		sampleWithOffsetFraction(vTextureCoord, redOffset * 4.0, baseRedDistanceOffsetMagnitude) +
		sampleWithOffsetFraction(vTextureCoord, redOffset * 5.0, baseRedDistanceOffsetMagnitude)) / 6.0;

	mediump vec4 greenBlendedSample =
		(sampleWithOffsetFraction(vTextureCoord, 0.0, baseGreenDistanceOffsetMagnitude) +
		sampleWithOffsetFraction(vTextureCoord, greenOffset * 1.0, baseGreenDistanceOffsetMagnitude) +
		sampleWithOffsetFraction(vTextureCoord, greenOffset * 2.0, baseGreenDistanceOffsetMagnitude) +
		sampleWithOffsetFraction(vTextureCoord, greenOffset * 3.0, baseGreenDistanceOffsetMagnitude) +
		sampleWithOffsetFraction(vTextureCoord, greenOffset * 4.0, baseGreenDistanceOffsetMagnitude) +
		sampleWithOffsetFraction(vTextureCoord, greenOffset * 5.0, baseGreenDistanceOffsetMagnitude)) / 6.0;

	mediump vec4 blueBlendedSample =
		(sampleWithOffsetFraction(vTextureCoord, 0.0, baseBlueDistanceOffsetMagnitude) +
		sampleWithOffsetFraction(vTextureCoord, blueOffset * 1.0, baseBlueDistanceOffsetMagnitude) +
		sampleWithOffsetFraction(vTextureCoord, blueOffset * 2.0, baseBlueDistanceOffsetMagnitude) +
		sampleWithOffsetFraction(vTextureCoord, blueOffset * 3.0, baseBlueDistanceOffsetMagnitude) +
		sampleWithOffsetFraction(vTextureCoord, blueOffset * 4.0, baseBlueDistanceOffsetMagnitude) +
		sampleWithOffsetFraction(vTextureCoord, blueOffset * 5.0, baseBlueDistanceOffsetMagnitude)) / 6.0;

	gl_FragColor = (vec4(redBlendedSample.x, 0.0, 0.0, redBlendedSample.w) +
		vec4(0.0, greenBlendedSample.y, 0.0, greenBlendedSample.w) +
		vec4(0.0, 0.0, blueBlendedSample.z, blueBlendedSample.w)) * vec4(1.0, 1.0, 1.0, 1.0 / 3.0);
}