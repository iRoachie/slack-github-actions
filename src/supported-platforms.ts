import core from '@actions/core';

// https://www.typescriptlang.org/play?#code/MYewdgzgLgBANgQzAcwK4OQUwjAvDAbQFgAoGGAckxTgEsIALCgGlPIoDMAna4J0gLowEOUJCilJJKAE8ADphgBlVHLkguUTABMAMkjQZF+WQpAd4B9FggEwqALYAjTFwFSx0YcGCY5UfRRrYxgACkQgowAuZVV1TR1AwywASjwAPhgAb1IAXykEHz8AqyNQqhp6JhSgA
export const supportedPlatforms = ['slack', 'cliq'] as const;
export type SupportedPlatform = typeof supportedPlatforms[number];

export const validatePlatforms = () => {
  return core
    .getInput('platforms')
    .split(',')
    .map((platform) => platform.trim() as SupportedPlatform)
    .reduce(
      (platforms, platform) => {
        if (supportedPlatforms.includes(platform)) {
          platforms.supported.push(platform);
        } else {
          platforms.unsupported.push(platform);
        }
        return platforms;
      },
      { supported: [], unsupported: [] }
    );
};
