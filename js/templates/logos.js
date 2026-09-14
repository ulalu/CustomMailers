const WIDE_LOGO_DIR = 'assets/img/logos/logo-wide';

export const WIDE_LOGO_ASPECT_RATIO = 3342 / 516;

const wideLogoFiles = {
  duo: 'abdul-for us-senate-logo-primary-duo.png',
  navy: 'abdul-for us-senate-logo-primary-navy.png',
  dark: 'abdul-for us-senate-logo-primary-dark.png',
  red: 'abdul-for us-senate-logo-primary-red.png',
  light: 'abdul-for us-senate-logo-primary-light.png',
  gold: 'abdul-for us-senate-logo-primary-gold.png',
};

const wideLogoNames = {
  duo: 'Navy + Red',
  navy: 'Navy',
  dark: 'Charcoal',
  red: 'Red',
  light: 'Cream',
  gold: 'Gold',
};

export function wideLogoSrc(logoId) {
  return encodeURI(`${WIDE_LOGO_DIR}/${wideLogoFiles[logoId]}`);
}

export function wideLogoName(logoId) {
  return wideLogoNames[logoId];
}

export function resolveLogoId(colorway, logoId) {
  if (colorway === null) {
    return null;
  }
  return colorway.logoOptions.includes(logoId) ? logoId : colorway.logoOptions[0];
}
