// FragmentShaderGouradTexture.shader - Generic gouraud shading
//                                      fragment shader with texturing

// Author: Ayodeji Oshinnaiye

varying mediump vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform mediump vec3 uniform_ambientLightVector;
varying mediump vec3 vNormalVector;
varying mediump vec3 vPosition;

varying lowp vec4 vBaseFragmentColor;

uniform mediump vec4 uniform_pointLightColor;
uniform mediump vec3 uniform_pointLightPosition;
uniform mediump float uniform_pointLightContributionFraction;
uniform mediump float uniform_brightnessMultiplier;

void main() {
	const mediump float lightContributionFraction = 0.9;
	const mediump vec4 ambientLightColor = vec4(1.0, 1.0, 1.0, 1.0);
	const mediump vec4 baseIllumination = vec4(1.0, 1.0, 1.0, 1.0);

	mediump float ambientContributionFraction = (lightContributionFraction - (lightContributionFraction * uniform_pointLightContributionFraction));
	
	mediump float ambientDotProduct = dot(normalize(vNormalVector), -normalize(uniform_ambientLightVector));
	mediump float pointLightDotProduct = dot(normalize(vNormalVector), normalize(vPosition.xyz - uniform_pointLightPosition.xyz));

	mediump float baseContributionFraction = 1.0 - lightContributionFraction;
		
	mediump vec4 pointLightColor = uniform_pointLightColor * (1.0 / pow(distance(uniform_pointLightPosition, vPosition), 2.0));
	
	mediump vec4 ambientContibution = vec4(ambientLightColor.xyz * pow(abs(ambientDotProduct), 1.0) * ambientContributionFraction, 1.0);
	mediump vec4 baseContribution = vec4(baseIllumination.xyz * baseContributionFraction, 1.0);
	mediump vec4 pointLightContribution = vec4(pointLightColor.xyz * abs(pointLightDotProduct) * uniform_pointLightContributionFraction, 1.0);
		
	//mediump vec4 texelWithAmbient = vec4((texture2D(uSampler, vTextureCoord) * (baseContributionFraction + ambientContibution)).xyz, 1.0);
	//mediump vec4 pointLightColorWithContribution = vec4(pointLightColor.xyz * uniform_pointLightContributionFraction, 1.0);
	
	
	mediump vec4 totalLightContribution = vec4(baseContribution.xyz + ambientContibution.xyz + pointLightContribution.xyz, 1.0);
	
	gl_FragColor = clamp(texture2D(uSampler, vTextureCoord) * vec4(uniform_brightnessMultiplier, uniform_brightnessMultiplier, uniform_brightnessMultiplier, 1.0) * totalLightContribution, 0.0, 1.0);
	
}