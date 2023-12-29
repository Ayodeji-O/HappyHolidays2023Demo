// FragmentShaderBackdrop.shader - Renders a slightly blurred, darkened
// texture

// Author: Ayodeji Oshinnaiye

varying mediump vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform highp ivec2 vTextureDimensions;

uniform highp float uniform_usePremultipliedAlphaFlag;

mediump vec2 getUnitNormalizedTexCoord(in mediump vec2 textureCoord) {
	mediump vec2 unitNormalizedTextureCoord = vec2(mod(textureCoord.x, 1.0), mod(textureCoord.y, 1.0));
	return unitNormalizedTextureCoord;
}

mediump float kernel[8];

void main() {
	const mediump float kDarkeningCoefficient = 0.85;
	
	const int blurBoxSize = 7;
	const int loopStart = -blurBoxSize / 2;
	const mediump float pi = acos(0.0);
	const mediump float sigma = 3.2;
	const mediump float coefficient = 1.0 / (2.0 * pi * sigma * sigma);
	const mediump float exponentDenominator = 2.0 * sigma * sigma;
	
	mediump vec2 texelIncrement = vec2(1.0 / float(vTextureDimensions.x), 1.0 / float(vTextureDimensions.y));
		
	mediump vec4 colorSum = vec4(0.0, 0.0, 0.0, 0.0);
	for (int loopY = loopStart; loopY <= blurBoxSize / 2; loopY++) {
		for (int loopX = loopStart; loopX <= blurBoxSize / 2; loopX++) {
			mediump vec2 currentOffset = vec2(float(loopX) * texelIncrement.x, float(loopY) * texelIncrement.y);
			mediump vec4 textureSample = texture2D(uSampler, getUnitNormalizedTexCoord(currentOffset + vTextureCoord));
			mediump float absX = abs(float(loopX));
			mediump float absY = abs(float(loopY));
			colorSum += textureSample * coefficient * exp(-(((absX * absX) + (absY * absY)) / exponentDenominator));
		}
	}

	mediump vec4 blurredTexel = colorSum;// / float(blurBoxSize * blurBoxSize);
	mediump float alphaIsZeroFlag = max(step(blurredTexel.w, 0.0), uniform_usePremultipliedAlphaFlag);
	mediump float divisor = alphaIsZeroFlag + (blurredTexel.w * (1.0 - alphaIsZeroFlag));	
	mediump vec3 darkenedTexelNoAlpha = clamp(blurredTexel.xyz / divisor, 0.0, 1.0) * kDarkeningCoefficient;
	
	mediump vec4 finalColor = vec4(darkenedTexelNoAlpha, blurredTexel.w);
	
	gl_FragColor = finalColor;
}
