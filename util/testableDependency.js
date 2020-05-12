// 2 métodos testáveis, com injeção (manual) de dependência. Para automática, procurar depois por "Awilix". É beem tranquilo e prazeroso de usar :)

module.exports = ({ logger }) => {

    const method1 = (arg1, arg2) => {
        logger.log(arg1, arg2);
        return `${arg1} and ${arg2}`;
    };

    // arrow simples retornando um objeto:
    // {'singleParameter': singleParameter(valor)}
    const internalNameMethod = singleParameter => ({
        [singleParameter]: singleParameter
    });

    return {
        method1,
        method2: internalNameMethod
    }
};