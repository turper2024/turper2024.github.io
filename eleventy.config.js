const dynamicCategories = require('eleventy-plugin-dynamic-categories');
const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginTOC = require('eleventy-plugin-nesting-toc');
const moment = require('moment');
const { DateTime } = require("luxon");

// const req = require('require-esm-in-cjs');

function dateToRfc822(d) {
    const rfc822Date = moment(d).format('ddd, DD MMM YYYY HH:mm:ss ZZ');
    return rfc822Date;
}

const filters = {
    format: function (date, format) {
        return DateTime.fromJSDate(date).toFormat(String(format)) /*
               DateTime.fromJSDate(page.date, {zone: 'utc'}).toLocaleString(DateTime.DATE_FULL)
        */
    },
    'dateIso': function(date) {
        //return moment(date).toISOString();
        return moment(date).format("YYYY-MM-DD");
    },
    'htmlDateString': function(date) {
        return DateTime.fromJSDate(date, {zone: 'utc'}).toFormat('yyyy-LL-dd');
    },
    'rssLastUpdatedRfc822Date': function(collection) {
        if( !collection || !collection.length ) {
            throw new Error( "Collection is empty in rssLastUpdatedDate filter." );
        }

        // Newest date in the collection
        return dateToRfc822(collection[ collection.length - 1 ].date);
    },
    'rssRfc822Date': function(date) {
        return dateToRfc822(date)
    }
}

module.exports = function(eleventyConfig) {
    // Set the collection to reverse chronological order
    eleventyConfig.addPlugin(dynamicCategories, {
        categoryVar: "categories", // Name of your category variable from your frontmatter (default: categories)
        itemsCollection: "post", // Name of your collection to use for the items (default: posts)
        perPageCount: 10 // Items per page of your paginated category (default: 5)
    })
    eleventyConfig.addPlugin(pluginRss);
    eleventyConfig.addPlugin(pluginTOC);

    Object.keys(filters).forEach(filterName => {
        console.log(filterName);
        eleventyConfig.addFilter(filterName, filters[filterName])
    });

    eleventyConfig.addPassthroughCopy({ "./src/assets": "/" });

    let markdownIt = require("markdown-it");
    let markdownItEmoji = require("markdown-it-emoji");
    let markdownItFootnote = require('markdown-it-footnote');
    let markdownItAnchor = require('markdown-it-anchor');
    let options = {
        html: true,
        breaks: false,
        linkify: true,
        typographer: true
    };
    const link_icon = '<svg class="octicon octicon-link" style="vertical-align: middle;" role="img" aria-hidden="true" width="16" height="16"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="/icons.svg#octicon-link"></use></svg>'
    let markdownLib = markdownIt(options).use(markdownItFootnote).use(markdownItAnchor, {permalink: markdownItAnchor.permalink.linkInsideHeader({symbol: link_icon, placement: 'before'})}).use(markdownItEmoji);
    eleventyConfig.setLibrary("md", markdownLib);


    return {
        markdownTemplateEngine: "njk",
        htmlTemplateEngine: "njk",
        templateFormats: ["html", "njk", "md"],
        dir: {
            input: "src",
            output: "_site", // This is the default, but it's included here for clarity.
            includes: "_templates",
            data: "data"
        }
    }
};
