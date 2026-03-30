const { Component } = require('inferno');
const {cacheComponent} = require('hexo-component-inferno/lib/util/cache');

class RecentPosts extends Component {
    render() {
        const { title, posts } = this.props;

        return <div class="card widget">
            <div class="card-content">
                <h3 class="menu-label">{title}</h3>
                <div class="recent-notes">
                    {posts.map(post => <article class="recent-note">
                        <p class="recent-note-date">
                            <time dateTime={post.dateXml}>{post.date}</time>
                        </p>
                        <p class="recent-note-title">
                            <a href={post.url}>{post.title}</a>
                        </p>
                        {post.category ? <p class="recent-note-category">{post.category}</p> : null}
                    </article>)}
                </div>
            </div>
        </div>;
    }
}

module.exports = RecentPosts.Cacheable = cacheComponent(RecentPosts, 'widget.recentposts', props => {
    const { site, helper } = props;
    const { url_for, __, date_xml, date } = helper;
    if (!site.posts.length) {
        return null;
    }
    const posts = site.posts.sort('date', -1).filter((item, index, arr) => item.encrypt != true).limit(5).map(post => ({
        url: url_for(post.link || post.path),
        title: post.title,
        date: date(post.date),
        dateXml: date_xml(post.date),
        category: post.categories.length ? post.categories.data[0].name : null
    }));
    return {
        posts,
        title: __('widget.recents')
    };
});
