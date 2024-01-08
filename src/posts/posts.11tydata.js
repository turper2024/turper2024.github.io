const { DateTime } = require("luxon")
module.exports = {
    layout: "layouts/post.njk",
    tags: ["post"],
    author: "Turmalin Peridot",
    eleventyComputed: {
        dateString: ({page}) => DateTime.fromJSDate(page.date, {zone: 'utc'}).toLocaleString(DateTime.DATE_FULL)
    }
}