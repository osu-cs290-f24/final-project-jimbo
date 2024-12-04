document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');

    function renderHome() {
        app.innerHTML = `
            <h2>패션 피드</h2>
            <div id="posts"></div>
            <button id="newPostBtn">새 게시물 작성</button>
        `;
        fetchPosts();
    }

    function fetchPosts() {
        fetch('/api/posts')
            .then(response => response.json())
            .then(posts => {
                const postsContainer = document.getElementById('posts');
                postsContainer.innerHTML = posts.map(post => `
                    <div class="post">
                        <h3>${post.title}</h3>
                        <p>${post.content}</p>
                    </div>
                `).join('');
            });
    }

    function renderARFitting() {
        app.innerHTML = `
            <div class="ar-fitting">
                <h2>AR 가상 피팅룸</h2>
                <p>여기에 AR 기능이 구현됩니다.</p>
            </div>
        `;
    }

    document.body.addEventListener('click', (e) => {
        if (e.target.matches('nav a')) {
            e.preventDefault();
            const page = e.target.getAttribute('href').substring(1);
            switch (page) {
                case 'home':
                    renderHome();
                    break;
                case 'ar-fitting':
                    renderARFitting();
                    break;
                // 다른 페이지들도 여기에 추가
            }
        }
    });

    // 초기 렌더링
    renderHome();
});
