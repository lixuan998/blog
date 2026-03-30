const { Component } = require('inferno');
const gravatrHelper = require('hexo-util').gravatar;
const { cacheComponent } = require('hexo-component-inferno/lib/util/cache');

class Profile extends Component {
    renderSocialLinks(links) {
        if (!links.length) {
            return null;
        }
        return <div class="level is-mobile">
            {links.filter(link => typeof link === 'object').map(link => {
                return <a class="level-item button is-transparent is-marginless"
                    target="_blank" rel="noopener" title={link.name} href={link.url}>
                    {'icon' in link ? <i class={link.icon}></i> : link.name}
                </a>;
            })}
        </div>;
    }

    render() {
        const {
            avatar,
            avatarRounded,
            author,
            authorTitle,
            location,
            statement,
            focus,
            counter,
            followLink,
            followTitle,
            socialLinks,
            hasHitokoto,
            hitokotoFrom,
            hitokotoProvider
        } = this.props;

        const hitokotoJs = `function getYiyan(){
                                $.getJSON("https://v1.hitokoto.cn/", function (data) {
                                if(data){
                                    $('#hitokoto').html("");
                                    $('#hitokoto').append("<strong style='color: #3273dc;'>"+data.hitokoto+"</strong>"+
                                    "<p>"+"${hitokotoFrom}《"+data.from+"》</p><p>${hitokotoProvider}-"+data.creator+"</p>");
                                }});}
                                $(function (){getYiyan();$('#hitokoto').click(function(){getYiyan();})});`;

        return <div class="card widget" data-type="profile">
            <div class="card-content">
                <div class="profile-shell">
                    <div class="profile-copy">
                        <p class="profile-eyebrow">SYSTEM PROFILE</p>
                        {author ? <p class="title is-size-4 is-block profile-name" style={{'line-height': 'inherit'}}>{author}</p> : null}
                        {authorTitle ? <p class="is-size-6 is-block profile-role">{authorTitle}</p> : null}
                        {location ? <p class="is-size-6 is-flex profile-location">
                            <i class="fas fa-map-marker-alt mr-1"></i>
                            <span>{location}</span>
                        </p> : null}
                        {statement ? <p class="profile-statement">{statement}</p> : null}
                    </div>
                    <figure class="image is-96x96 profile-avatar-shell">
                        <img class={'avatar' + (avatarRounded ? ' is-rounded' : '')} src={avatar} alt={author} />
                    </figure>
                </div>
                {focus && focus.length ? <div class="profile-focus">
                    {focus.map(item => <span class="tag profile-focus-tag">{item}</span>)}
                </div> : null}
                <nav class="level is-mobile profile-stats">
                    <div class="level-item has-text-centered is-marginless">
                        <div>
                            <p class="heading profile-stat-label">{counter.post.title}</p>
                            <a href={counter.post.url}>
                                <p class="title profile-stat-value">{counter.post.count}</p>
                            </a>
                        </div>
                    </div>
                    <div class="level-item has-text-centered is-marginless">
                        <div>
                            <p class="heading profile-stat-label">{counter.category.title}</p>
                            <a href={counter.category.url}>
                                <p class="title profile-stat-value">{counter.category.count}</p>
                            </a>
                        </div>
                    </div>
                    <div class="level-item has-text-centered is-marginless">
                        <div>
                            <p class="heading profile-stat-label">{counter.tag.title}</p>
                            <a href={counter.tag.url}>
                                <p class="title profile-stat-value">{counter.tag.count}</p>
                            </a>
                        </div>
                    </div>
                </nav>
                {followLink ? <div class="level">
                    <a class="level-item button is-primary is-rounded" href={followLink} target="_blank" rel="noopener">{followTitle}</a>
                </div> : null}
                {socialLinks ? this.renderSocialLinks(socialLinks) : null}
                {hasHitokoto == undefined || hasHitokoto ? <div>
                    <hr />
                    <p id="hitokoto">:D 一言句子获取中...</p>
                    <script type="text/javascript" dangerouslySetInnerHTML={{ __html: hitokotoJs }} defer={true}></script>
                </div> : null}

            </div>
        </div>;
    }
}

Profile.Cacheable = cacheComponent(Profile, 'widget.profile', props => {
    const { site, helper, widget } = props;
    const {
        avatar,
        gravatar,
        avatar_rounded = false,
        author = props.config.author,
        author_title,
        location,
        statement,
        focus,
        follow_link,
        social_links,
        has_hitokoto
    } = widget;
    const { url_for, _p, __ } = helper;

    function getAvatar() {
        if (gravatar) {
            return gravatrHelper(gravatar, 128);
        }
        if (avatar) {
            return url_for(avatar);
        }
        return url_for('/img/avatar.png');
    }

    const postCount = site.posts.length;
    const categoryCount = site.categories.filter(category => category.length).length;
    const tagCount = site.tags.filter(tag => tag.length).length;

    const socialLinks = social_links ? Object.keys(social_links).map(name => {
        const link = social_links[name];
        if (typeof link === 'string') {
            return {
                name,
                url: url_for(link)
            };
        }
        return {
            name,
            url: url_for(link.url),
            icon: link.icon
        };
    }) : null;

    return {
        avatar: getAvatar(),
        avatarRounded: avatar_rounded,
        author,
        authorTitle: author_title,
        location,
        statement,
        focus,
        counter: {
            post: {
                count: postCount,
                title: _p('common.post', postCount),
                url: url_for('/archives/')
            },
            category: {
                count: categoryCount,
                title: _p('common.category', categoryCount),
                url: url_for('/categories/')
            },
            tag: {
                count: tagCount,
                title: _p('common.tag', tagCount),
                url: url_for('/tags/')
            }
        },
        followLink: follow_link ? url_for(follow_link) : undefined,
        followTitle: __('widget.follow'),
        socialLinks,
        hitokotoFrom: __('widget.hitokoto_from'),
        hitokotoProvider: __('widget.hitokoto_provider'),
        hasHitokoto: has_hitokoto
    };
});

module.exports = Profile;
