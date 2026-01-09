import next from 'eslint-config-next';
import prettier from 'eslint-config-prettier';

const eslintConfig = [
  ...next,
  prettier,
];

export default eslintConfig;
