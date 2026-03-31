const { Component, Fragment } = require('inferno');
const Paginator = require('hexo-component-inferno/lib/view/misc/paginator');
const Article = require('./common/article');

module.exports = class extends Component {
    render() {
        const { config, page, helper } = this.props;
        const { __, url_for } = helper;

        return <Fragment>
            {page.posts.length ? page.posts.map((post, index, arr) => <Article config={config} page={post} helper={helper} index={true} indexAt={index} />) : <div class="card home-empty">
                <div class="card-content home-empty-shell">
                    <img class="home-empty-mark" src={url_for(config.logo || '/images/kernel-chip-mark.png')} alt={config.title} />
                    <p class="home-empty-kicker">HACKING FIELD</p>
                    <h1 class="title is-2 home-empty-title">{config.title}</h1>
                    <p class="home-empty-copy">公开文章暂未发布。后续会在这里整理真实的内核、调度器、内存管理与 I/O 路径内容。</p>
                    <div class="buttons is-centered home-empty-actions">
                        <a class="button is-primary" href={url_for('/about')}>关于本站</a>
                    </div>
                </div>
            </div>}
            {page.total > 1 ? <Paginator
                current={page.current}
                total={page.total}
                baseUrl={page.base}
                path={config.pagination_dir}
                urlFor={url_for}
                prevTitle={__('common.prev')}
                nextTitle={__('common.next')} /> : null}
        </Fragment>;
    }
};
