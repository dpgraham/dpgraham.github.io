import jQuery from 'jquery';
import { jsdom } from 'jsdom';
import path from 'path';
import replaceExtension from 'replace-ext';
import isAbsoluteUrl from 'is-absolute-url';

const $ = jQuery(jsdom().defaultView);

/**
 * Markdown doesn't render absolute links to markdown files (see https://github.com/mkdocs/mkdocs/issues/1172)
 *
 * @param {String} html
 */
export function reassignMarkdownLink (html) {
  const jqHTML = $(html);
  const anchorTags = jqHTML.find('a');
  anchorTags.each((index, tag) => {
    const anchorTag = $(tag);
    let href = anchorTag.attr('href');
    const hashRegex = /#[\w\W]*/;
    const hashMatches = href.match(hashRegex);
    const hrefHash = hashMatches ? hashMatches[0] : '';
    href = href.replace(hashRegex, '');

    if (href && !isAbsoluteUrl(href)) {
      const ext = path.extname(href);
      if (ext === '.md') {
        anchorTag.attr('href', `${replaceExtension(href, '')}/index.html${hrefHash}`);
      }
    }
  });
  return jqHTML.html();
}

/**
 * Takes a document, parses out the body and then remaps anchor tags to point to HTML links
 * @param {*} htmlDocString
 */
export function reassignMarkdownLinkDocument (htmlDocString) {
  const body = '<div id="body-mock">' + htmlDocString.replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/ig, '') + '</div>';
  const newBody = reassignMarkdownLink(body);
  const bodyStart = htmlDocString.indexOf('<body>') + '<body>'.length;
  const bodyEnd = htmlDocString.indexOf('</body>');
  return htmlDocString.substr(0, bodyStart) + newBody + htmlDocString.substr(bodyEnd, htmlDocString.length - bodyEnd);
}