module.exports = {
    awaitLast: async (summaries, result) => {
        const l = Array.from(summaries);

        const first = await Promise.race(summaries);

        result.push(first);

        for (const [key, value] of Object.entries(summaries)) {
            // TODO: Verify another approch
            // eslint-disable-next-line no-await-in-loop
            const r = await value;

            if (r === first) {
                l.splice(key, 1);
            }
        }

        if (l.length === 0) {
            return result;
        }

        return module.exports.awaitLast(l, result);
    }
};
