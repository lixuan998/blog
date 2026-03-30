'use strict';

hexo.extend.generator.register('empty_home', function (locals) {
    if (locals.posts && locals.posts.length) {
        return [];
    }

    return {
        path: 'index.html',
        data: {
            layout: 'index',
            path: '',
            base: '',
            current: 1,
            total: 0,
            posts: []
        },
        layout: ['index']
    };
});
