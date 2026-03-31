'use strict';

hexo.extend.generator.register('empty_archives', function (locals) {
    if (locals.posts && locals.posts.length) {
        return [];
    }

    return {
        path: 'archives/index.html',
        data: {
            layout: 'archive',
            path: 'archives/index.html',
            base: 'archives/',
            current: 1,
            total: 0,
            posts: locals.posts
        },
        layout: ['archive']
    };
});
