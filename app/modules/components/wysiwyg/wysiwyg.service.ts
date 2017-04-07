/*
 * Copyright (C) 2014-2017 Andrey Antukh <niwi@niwi.nz>
 * Copyright (C) 2014-2017 Jesús Espino Garcia <jespinog@gmail.com>
 * Copyright (C) 2014-2017 David Barragán Merino <bameda@dbarragan.com>
 * Copyright (C) 2014-2017 Alejandro Alonso <alejandro.alonso@kaleidos.net>
 * Copyright (C) 2014-2017 Juan Francisco Alcántara <juanfran.alcantara@kaleidos.net>
 * Copyright (C) 2014-2017 Xavi Julian <xavier.julian@kaleidos.net>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 * File: modules/components/wysiwyg/wysiwyg.service.coffee
 */

class WysiwygService {
    static initClass() {
        this.$inject = [
            "tgWysiwygCodeHightlighterService",
            "tgProjectService",
            "$tgNavUrls"
        ];
    }
    constructor(wysiwygCodeHightlighterService, projectService, navurls) {
        this.wysiwygCodeHightlighterService = wysiwygCodeHightlighterService;
        this.projectService = projectService;
        this.navurls = navurls;
    }

    searchEmojiByName(name) {
        return _.filter(this.emojis, it => it.name.indexOf(name) !== -1);
    }

    setEmojiImagePath(emojis) {
        return this.emojis = _.map(emojis, function(it) {
            it.image = `/${window._version}/emojis/` + it.image;

            return it;
        });
    }

    loadEmojis() {
        return $.getJSON(`/${window._version}/emojis/emojis-data.json`).then(this.setEmojiImagePath.bind(this));
    }

    getEmojiById(id) {
        return _.find(this.emojis, it => it.id === id);
    }

    getEmojiByName(name) {
        return _.find(this.emojis, it => it.name === name);
    }

    replaceImgsByEmojiName(html) {
        let emojiIds = taiga.getMatches(html, /emojis\/([^"]+).png"/gi);

        for (let emojiId of Array.from(emojiIds)) {
            let regexImgs = new RegExp(`<img(.*)${emojiId}[^>]+\>`, 'g');
            let emoji = this.getEmojiById(emojiId);
            html = html.replace(regexImgs, `:${emoji.name}:`);
        }

        return html;
    }

    replaceEmojiNameByImgs(text) {
        let emojiIds = taiga.getMatches(text, /:([\w ]*):/g);

        for (let emojiId of Array.from(emojiIds)) {
            let regexImgs = new RegExp(`:${emojiId}:`, 'g');
            let emoji = this.getEmojiByName(emojiId);

            if (emoji) {
                text = text.replace(regexImgs, `![alt](${emoji.image})`);
            }
        }

        return text;
    }

    pipeLinks(text) {
        return text.replace(/\[\[(.*?)\]\]/g, function(match, p1, offset, str) {
            let linkParams = p1.split('|');

            let link = linkParams[0];
            let title = linkParams[1] || linkParams[0];

            return `[${title}](${link})`;
        });
    }


    linkTitleWithSpaces(text) {
        let link = /\[[^\]]*\]\(([^\)]*)\)/g; // [Title-with-spaces](Title with spaces)

        return text.replace(link, function(match, p1, offset, str) {
            if (p1.indexOf(' ') >= 0) {
                return match.replace(/\(.*\)/, `(${taiga.slugify(p1)})`);
            } else {
                return match;
            }
        });
    }

    replaceUrls(html) {
        let el = document.createElement( 'html' );
        el.innerHTML = html;

        let links = el.querySelectorAll('a');

        for (let link of Array.from(links)) {
            if (link.getAttribute('href').indexOf('/profile/') !== -1) {
                link.parentNode.replaceChild(document.createTextNode(link.innerText), link);
            } else if (link.getAttribute('href').indexOf('/t/') !== -1) {
                link.parentNode.replaceChild(document.createTextNode(link.innerText), link);
            }
        }

        return el.innerHTML;
    }

    searchWikiLinks(html) {
        let el = document.createElement( 'html' );
        el.innerHTML = html;

        let links = el.querySelectorAll('a');

        for (let link of Array.from(links)) {
            if (link.getAttribute('href').indexOf('/') === -1) {
                let url = this.navurls.resolve('project-wiki-page', {
                    project: this.projectService.project.get('slug'),
                    slug: link.getAttribute('href')
                });

                link.setAttribute('href', url);
            }
        }

        return el.innerHTML;
    }

    removeTrailingListBr(text) {
        return text.replace(/<li>(.*?)<br><\/li>/g, '<li>$1</li>');
    }

    getMarkdown(html) {
        // https://github.com/yabwe/medium-editor/issues/543
        let cleanIssueConverter = {
            filter: ['html', 'body', 'span', 'div'],
            replacement(innerHTML) {
                return innerHTML;
            }
        };

        let codeLanguageConverter = {
            filter:  node => {
                return (node.nodeName === 'PRE') &&
                  node.firstChild &&
                  (node.firstChild.nodeName === 'CODE');
            },
            replacement: (content, node) => {
                let lan = this.wysiwygCodeHightlighterService.getLanguageInClassList(node.firstChild.classList);
                if (!lan) { lan = ''; }

                return `\n\n\`\`\`${lan}\n${_.trim(node.firstChild.textContent)}\n\`\`\`\n\n`;
            }
         };

        html = html.replace(/&nbsp;(<\/.*>)/g, "$1");
        html = this.replaceImgsByEmojiName(html);
        html = this.replaceUrls(html);
        html = this.removeTrailingListBr(html);

        let markdown = toMarkdown(html, {
            gfm: true,
            converters: [cleanIssueConverter, codeLanguageConverter]
        });

        return markdown;
    }

    parseMentionMatches(text) {
        let serviceName = 'twitter';
        let { tagBuilder } = this;
        let matches = [];

        let regex = /@[^\s]{1,50}[^.\s]/g;
        let m = regex.exec(text);

        while (m !== null) {
            var offset = m.index;
            let prevChar = text.charAt( offset - 1 );

            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }

            m.forEach((match, groupIndex) =>
                matches.push( new Autolinker.match.Mention({
                    tagBuilder,
                    matchedText   : match,
                    offset,
                    serviceName,
                    mention       : match.slice(1)
                }))
            );

            m = regex.exec(text);
        }

        return matches;
    }

    autoLinkHTML(html) {
        // override Autolink parser
        
        let matchRegexStr = String(Autolinker.matcher.Mention.prototype.matcherRegexes.twitter);
        if (matchRegexStr.indexOf('.') === -1) {
            matchRegexStr = '@[^\s]{1,50}[^.\s]';
        }

        let autolinker = new Autolinker({
            mention: 'twitter',
            hashtag: 'twitter',
            replaceFn: match => {
                if  (match.getType() === 'mention') {
                    let profileUrl = this.navurls.resolve('user-profile', {
                        project: this.projectService.project.get('slug'),
                        username: match.getMention()
                    });

                    return `<a class="autolink" href="${profileUrl}">@${match.getMention()}</a>`;
                } else if (match.getType() === 'hashtag') {
                    let url = this.navurls.resolve('project-detail-ref', {
                        project: this.projectService.project.get('slug'),
                        ref: match.getHashtag()
                    });

                    return `<a class="autolink" href="${url}">#${match.getHashtag()}</a>`;
                }
            }
        });

        Autolinker.matcher.Mention.prototype.parseMatches = this.parseMentionMatches.bind(autolinker);

        return autolinker.link(html);
    }

    getHTML(text) {
        if (!text || !text.length) { return ""; }

        let options = {
            breaks: true
        };

        text = this.replaceEmojiNameByImgs(text);
        text = this.pipeLinks(text);        
        text = this.linkTitleWithSpaces(text);

        let md = window.markdownit({
            breaks: true
        });

        md.use(window.markdownitLazyHeaders);
        let result = md.render(text);
        result = this.searchWikiLinks(result);

        result = this.autoLinkHTML(result);

        return result;
    }
}
WysiwygService.initClass();

angular.module("taigaComponents")
    .service("tgWysiwygService", WysiwygService);
