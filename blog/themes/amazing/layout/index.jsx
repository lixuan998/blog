const { Component, Fragment } = require('inferno');
const Paginator = require('hexo-component-inferno/lib/view/misc/paginator');
const Article = require('./common/article');

module.exports = class extends Component {
    renderHero() {
        const { config, page, helper } = this.props;
        const { url_for, date } = helper;

        if (page.current && page.current > 1) {
            return null;
        }

        const latestPost = page.posts && page.posts.data && page.posts.data.length ? page.posts.data[0] : null;
        const visiblePostCount = page.posts && page.posts.length ? page.posts.length : (page.posts && page.posts.data ? page.posts.data.length : 0);
        const focusAreas = [
            ['mm/', '地址空间、页表、回收路径'],
            ['sched/', '唤醒链路、runqueue、尾延迟'],
            ['io/', 'page cache、块层、设备队列'],
            ['trace/', 'perf、ftrace、bpftrace、/proc']
        ];

        return <section class="card home-hero">
            <div class="card-content home-hero-content">
                <div class="home-hero-grid">
                    <div class="home-hero-copy">
                        <p class="home-eyebrow">SYSTEMS NOTEBOOK</p>
                        <h1 class="home-title">{config.title}</h1>
                        <p class="home-subtitle">{config.description}</p>
                        <div class="home-actions">
                            <a class="button is-primary home-action-primary" href={url_for('/archives')}>进入归档</a>
                            <a class="button is-light home-action-secondary" href={url_for('/about')}>关于站点</a>
                        </div>
                        <div class="home-stats">
                            <div class="home-stat">
                                <span class="home-stat-value">{visiblePostCount}</span>
                                <span class="home-stat-label">当前文章</span>
                            </div>
                            <div class="home-stat">
                                <span class="home-stat-value">4</span>
                                <span class="home-stat-label">核心主题</span>
                            </div>
                            <div class="home-stat">
                                <span class="home-stat-value">4</span>
                                <span class="home-stat-label">常用工具</span>
                            </div>
                        </div>
                    </div>
                    <div class="home-hero-panel">
                        <p class="home-panel-title">focus.map</p>
                        <div class="home-panel-body">
                            {focusAreas.map(item => <div class="home-panel-row">
                                <span class="home-panel-key">{item[0]}</span>
                                <span class="home-panel-value">{item[1]}</span>
                            </div>)}
                        </div>
                        {latestPost ? <div class="home-panel-footer">
                            <span class="home-panel-label">latest</span>
                            <a href={url_for(latestPost.link || latestPost.path)}>{latestPost.title}</a>
                            <span class="home-panel-date">{date(latestPost.date)}</span>
                        </div> : null}
                    </div>
                </div>
            </div>
        </section>;
    }

    render() {
        const { config, page, helper } = this.props;
        const { __, url_for } = helper;

        return <Fragment>
            {this.renderHero()}
            <section class="home-section-header">
                <p class="home-section-kicker">LATEST DISPATCHES</p>
                <h2 class="home-section-title">近期文章</h2>
            </section>
            {page.posts.map((post, index, arr) => <Article config={config} page={post} helper={helper} index={true} indexAt={index} />)}
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
