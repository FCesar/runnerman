module.exports = {
    plugins: ['security'],
    extends: ['airbnb-base', 'plugin:security/recommended'],
    env: {
        node: true,
        commonjs: true,
        jest: true
    },
    parserOptions: {
        sourceType: 'script'
    },
    rules: {
        indent: [2, 4, { SwitchCase: 1 }],
        'comma-dangle': ['error', 'never'],
        'arrow-parens': ['error', 'as-needed'],
        'class-methods-use-this': 'off',
        'implicit-arrow-linebreak': 'off',
        'function-paren-newline': ['error', 'consistent'],
        'max-len': [
            'error',
            {
                code: 120,
                ignoreComments: true,
                ignoreTrailingComments: true,
                ignoreUrls: true,
                ignoreStrings: true,
                ignoreTemplateLiterals: true
            }
        ],
        'no-confusing-arrow': 'off',
        'no-mixed-operators': ['error', { allowSamePrecedence: true }],
        'no-underscore-dangle': ['error', { allow: ['_meta', '_this'] }],
        'no-param-reassign': ['error', { props: false }],
        'object-curly-newline': ['error', { consistent: true }],
        'operator-linebreak': 'off',
        'security/detect-object-injection': 'off',
        'no-restricted-syntax': [
            'error',
            {
                selector: 'ForInStatement',
                message:
                    'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.'
            },
            {
                selector: 'LabeledStatement',
                message:
                    'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.'
            },
            {
                selector: 'WithStatement',
                message: '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.'
            }
        ],
        'no-console': 'off'
    }
};
