const { Component } = require('inferno');
const { cacheComponent } = require('hexo-component-inferno/lib/util/cache');

class Footer extends Component {
    render() {
        const {
            logo,
            logoUrl,
            siteUrl,
            siteTitle,
            siteYear,
            author,
            links,
            footerDescription
        } = this.props;

        let footerLogo = '';
        if (logo) {
            if (logo.text) {
                footerLogo = logo.text;
            } else {
                footerLogo = <img src={logoUrl} alt={siteTitle} height="28" />;
            }
        } else {
            footerLogo = siteTitle;
        }

        return <footer class="footer">
            <div class="container">
                <div class="site-footer-inner">
                    <div class="site-footer-brand">
                        <a class="footer-logo" href={siteUrl}>
                            {footerLogo}
                        </a>
                        <div class="site-footer-copy">
                            <p class="site-footer-title">{siteTitle}</p>
                            <p class="site-footer-meta">&copy; {siteYear} {author || siteTitle}</p>
                        </div>
                    </div>
                    {footerDescription ? <p class="site-footer-description" dangerouslySetInnerHTML={{ __html: footerDescription }}></p> : null}
                    {Object.keys(links).length ? <div class="site-footer-links">
                            {Object.keys(links).map(name => {
                                const link = links[name];
                                return <a class="site-footer-link" target="_blank" rel="noopener" title={name} href={link.url}>
                                        {link.icon ? <i class={link.icon}></i> : name}
                                    </a>;
                            })}
                        </div> : null}
                </div>
            </div>
        </footer>;
    }
}

module.exports = cacheComponent(Footer, 'common.footer', props => {
    const { config, helper } = props;
    const { url_for, date } = helper;
    const { logo, title, author, footer, footer_copyright_dsec } = config;

    const links = {};
    if (footer && footer.links) {
        Object.keys(footer.links).forEach(name => {
            const link = footer.links[name];
            links[name] = {
                url: url_for(typeof link === 'string' ? link : link.url),
                icon: link.icon
            };
        });
    }

    return {
        logo,
        logoUrl: url_for(logo),
        siteUrl: url_for('/'),
        siteTitle: title,
        siteYear: date(new Date(), 'YYYY'),
        author,
        links,
        footerDescription: footer_copyright_dsec
    };
});
