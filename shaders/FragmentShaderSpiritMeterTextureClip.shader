// FragmentShaderSpiritMeterTextureClip.shader - Generic texture mapping
// shader, with the ability to clip the trailing side

// Author: Ayodeji Oshinnaiye

varying mediump vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform highp float uniform_displayFraction;

void main() {
	const highp float topBoundary = 0.08;
	const highp float bottomBoundary = 0.86;
	const highp float leftBoundary = 0.005;
	const highp float rightBoundary = 0.99;
	
	highp float vertDerivedBoundaryMultiplier = step(topBoundary, vTextureCoord.y) * step(vTextureCoord.y, bottomBoundary);
	highp float horizDerivedBoundaryMultipier = step(leftBoundary, vTextureCoord.x) * step(vTextureCoord.x, rightBoundary);
	
	highp float clipActivation = step(clamp(uniform_displayFraction, leftBoundary, rightBoundary), vTextureCoord.x) *
		vertDerivedBoundaryMultiplier * horizDerivedBoundaryMultipier;
	
	gl_FragColor = texture2D(uSampler, vTextureCoord) * (1.0 - clipActivation);
}