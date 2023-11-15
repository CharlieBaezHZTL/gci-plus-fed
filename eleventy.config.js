const fs = require("fs")
const htmlmin = require("html-minifier");
const hjson = require("hjson");

module.exports = function (cfg) {
    cfg.addTransform("htmlmin", function(content) {
        if (!this.page.outputPath) return content;
        if (!this.page.outputPath.endsWith(".html")) return content;

        return htmlmin.minify(content, {
            collapseWhitespace: true,
            useShortDoctype: true,
        });
    });

    cfg.addDataExtension("hjson", contents => hjson.parse(contents));

    cfg.addPassthroughCopy("src/assets");

    // TODO: typescript
    cfg.addPassthroughCopy("src/scripts");

    cfg.setDataFileBaseName("meta");

    cfg.setFrontMatterParsingOptions({
        excerpt: true,
        excerpt_separator: "<<<",
    });

    cfg.setServerOptions({
        watch: [
            "./public/styles/**/*.css",
            "./public/scripts/**/*.js",
        ],
    });

    // Auto-generate layout aliases
    // FIX: *.11ty.js is aliased as *.11ty
    for (layout of fs.readdirSync("src/includes/layouts")) {
        cfg.addLayoutAlias(layout.replace(/\.[^/.]+$/, ""), `layouts/${layout}`);
    }

    return {
        dir: {
            input: "src",
            output: "public",
            includes: "includes",
            data: "data",
        },

        templateFormats: ["md", "html"],

        // Nunjucks all the way!
        markdownTemplateEngine: "njk",
        dataTemplateEngine: "njk",
        htmlTemplateEngine: "njk",
    };
};
