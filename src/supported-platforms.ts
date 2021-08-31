import core from '@actions/core';

export type supportedPlatform = 'slack' | 'cliq';
export const supportedPlatforms = ['slack', 'cliq'];

export const validatePlatforms = () => {
  return core
    .getInput('platforms')
    .split(',')
    .map((platform) => platform.trim())
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
