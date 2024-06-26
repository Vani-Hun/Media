window.popstate = function (event) {
    window.location.href = window.location.pathname
}
let likedVideoIds = customer.liked_videos
sessionStorage.setItem('videosData', JSON.stringify(videos));

if (videos && videos.length > 0) {
    const videosContainer = document.querySelector('.css-9fq6q2-DivOneColumnContainer')
    const containerMain = document.querySelector('.css-1t4vwes-DivMainContainer')
    const videoContainer = document.querySelector('.tiktok-1qg2388-DivBrowserModeContainer')

    const listVideoDiv = document.querySelector('.css-1t4vwes-DivMainContainer')
    const bigDiv = document.getElementById('bigDiv')
    const listDiv = document.querySelector(".css-14dcx2q-DivBodyContainer")
    let followedSet = new Set(customer.following.map(following => following.id))
    let likedVideoSet = new Set(likedVideoIds.map(video => video.id))

    //for videos event
    function showCustomAlert(message) {
        const customAlert = document.getElementById('customAlert');
        const alertMessage = document.getElementById('alertMessage');
        alertMessage.textContent = message;
        customAlert.style.display = 'flex';
        setTimeout(() => {
            customAlert.style.display = 'none';
        }, 1500);
    }
    function updateFollow(video, request) {
        let indexCurrent = JSON.parse(sessionStorage.getItem('videosData'))

        let indexOfVideoOfUser = indexCurrent
            .map((index, i) => index.user.id === video.user.id ? i : -1)
            .filter(index => index !== -1);
        if (request === "follow") {
            indexOfVideoOfUser.forEach(index => {
                let videoDiv = document.querySelectorAll('.css-1hhj6ie-DivTextInfoContainer')[index];
                let buttonElement = videoDiv.querySelector('button');
                buttonElement.classList = "css-zmqo9-Button-StyledFollowButtonTux"
                let buttonLabelDiv = document.querySelectorAll('.css-1djnsui-ButtonLabel')[index];
                buttonLabelDiv.innerHTML = "Following"
            });
        } else {
            indexOfVideoOfUser.forEach(index => {
                let videoDiv = document.querySelectorAll('.css-1hhj6ie-DivTextInfoContainer')[index];
                let buttonElement = videoDiv.querySelector('button');
                buttonElement.classList = "css-1847gtm-Button-StyledFollowButtonTux"
                let buttonLabelDiv = document.querySelectorAll('.css-1djnsui-ButtonLabel')[index];
                buttonLabelDiv.innerHTML = "Follow"
            });
        }


    }
    function updateCustomerAndFollow(video, actionType) {
        socket.emit('updateCustomer', { id: customer.id }, (data) => console.log(data));

        socket.on('updateCustomer', (data) => {
            customer = data;
            followedSet = new Set(customer.following.map(following => following.id));
            updateFollow(video, actionType);
        });
    }

    async function updateCustomerAndLike(video, likeIcon) {
        socket.emit('updateCustomer', { id: customer.id }, (data) => console.log(data));

        socket.on('updateCustomer', (data) => {
            customer = data;
            likedVideoIds = customer.liked_videos;
            likedVideoSet = new Set(likedVideoIds.map(video => video.id));

            if (likedVideoSet.has(video.id)) {
                likeIcon.style.color = "rgba(254, 44, 85)";
            } else {
                likeIcon.style.color = "rgba(22, 24, 35)";
            }
        });
    }
    function handleLike(videoId, likeIcon) {
        likeIcon.style.color = "rgba(22, 24, 35)";
        if (likedVideoSet.has(videoId)) {
            likeIcon.style.color = "rgba(254, 44, 85)";
        }
    }
    function handleFollow(userId, followButton, changeButton) {
        if (customer.id === userId) {
            let mainDiv = document.querySelector('.css-1hhj6ie-DivTextInfoContainer')
            let dotButton = document.querySelector('.inline-flex-DivActionContainer')
            if (dotButton) {
                dotButton.remove()
            }
            followButton.remove()

            const divVideo = document.createElement('div');
            divVideo.classList = "inline-flex-DivActionContainer"
            divVideo.style.display = "inline-flex";
            divVideo.innerHTML = `
            <svg class="css-1xafdg4-StyledEllipsisHorizontal e161jvwg1" width="1em" data-e2e="" height="1em" viewBox="0 0 48 48"
    fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd"
        d="M4 24C4 21.7909 5.79086 20 8 20C10.2091 20 12 21.7909 12 24C12 26.2091 10.2091 28 8 28C5.79086 28 4 26.2091 4 24ZM20 24C20 21.7909 21.7909 20 24 20C26.2091 20 28 21.7909 28 24C28 26.2091 26.2091 28 24 28C21.7909 28 20 26.2091 20 24ZM36 24C36 21.7909 37.7909 20 40 20C42.2091 20 44 21.7909 44 24C44 26.2091 42.2091 28 40 28C37.7909 28 36 26.2091 36 24Z">
    </path>
</svg>
            `

            mainDiv.appendChild(divVideo)
        } else {
            followButton.classList = "css-1847gtm-Button-StyledFollowButtonTux";
            changeButton.innerHTML = "Follow";
            if (followedSet.has(userId)) {
                followButton.classList = "css-zmqo9-Button-StyledFollowButtonTux";
                changeButton.innerHTML = "Following";
            }
        }
    }


    // for detail video event
    function updateVolumeIcon(isMuted, volumeButton) {
        const svg = volumeButton.querySelector('svg');
        svg.innerHTML = '';
        if (isMuted) {
            const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path1.setAttribute('fill-rule', 'evenodd');
            path1.setAttribute('clip-rule', 'evenodd');
            path1.setAttribute('d', 'M21 16.9118C21 15.2513 20.8942 15.0909 20.709 15.0221C20.5238 14.9763 20.3122 14.9992 20.1799 15.1138L15.0741 19.5258H11.4762C11.2116 19.5258 11 19.7092 11 19.9384V28.084C11 28.3132 11.2116 28.4965 11.4762 28.4965H15.0741L20.1799 32.8862C20.3122 33.0008 20.5238 33.0237 20.709 32.9779C20.8942 32.9091 21 32.7487 21 32.5882V16.9118Z'); // Đường dẫn path cho trạng thái muted
            path1.setAttribute('fill', 'white');
            svg.appendChild(path1);
            const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path2.setAttribute('fill-rule', 'evenodd');
            path2.setAttribute('clip-rule', 'evenodd');
            path2.setAttribute('d', 'M35.098 18.9489C34.5998 18.4508 33.7921 18.4508 33.2939 18.949L30.1368 22.1061L26.9797 18.949C26.4815 18.4508 25.6738 18.4508 25.1756 18.9489C24.6775 19.4471 24.6775 20.2548 25.1756 20.753L28.3327 23.9101L25.1757 27.0672C24.6775 27.5654 24.6775 28.3731 25.1757 28.8713C25.6738 29.3694 26.4815 29.3694 26.9797 28.8713L30.1368 25.7142L33.2939 28.8713C33.7921 29.3694 34.5998 29.3694 35.0979 28.8713C35.5961 28.3731 35.5961 27.5654 35.0979 27.0672L31.9409 23.9101L35.098 20.753C35.5962 20.2548 35.5962 19.4471 35.098 18.9489Z'); // Đường dẫn path cho trạng thái muted
            path2.setAttribute('fill', 'white');
            svg.appendChild(path2);
        } else {
            const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path1.setAttribute('fill-rule', 'evenodd');
            path1.setAttribute('clip-rule', 'evenodd');
            path1.setAttribute('d', 'M21 16.9118C21 15.2513 20.8942 15.0909 20.709 15.0221C20.5238 14.9763 20.3122 14.9992 20.1799 15.1138L15.0741 19.5258H11.4762C11.2116 19.5258 11 19.7092 11 19.9384V28.084C11 28.3132 11.2116 28.4965 11.4762 28.4965H15.0741L20.1799 32.8862C20.3122 33.0008 20.5238 33.0237 20.709 32.9779C20.8942 32.9091 21 32.7487 21 32.5882V16.9118Z'); // Đường dẫn path cho trạng thái unmuted
            path1.setAttribute('fill', 'white');
            svg.appendChild(path1);
            const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path2.setAttribute('d', 'M30.6653 15C32.7348 17.2304 34.0001 20.2174 34.0001 23.5C34.0001 26.7826 32.7348 29.7696 30.6653 32');
            path2.setAttribute('stroke', 'white');
            path2.setAttribute('stroke-width', '2.5');
            path2.setAttribute('stroke-linecap', 'round');
            svg.appendChild(path2);
            const path3 = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path3.setAttribute('d', 'M26.8799 17.8833C28.1994 19.381 28.9999 21.347 28.9999 23.5C28.9999 25.653 28.1994 27.6191 26.8799 29.1168');
            path3.setAttribute('stroke', 'white');
            path3.setAttribute('stroke-width', '2.5');
            path3.setAttribute('stroke-linecap', 'round');
            svg.appendChild(path3);
        }
    }
    function formatTimeDifference(updateAt) {
        const dateObject = new Date(updateAt);
        const today = new Date();
        const timeDifference = today - dateObject;

        const minuteInMilliseconds = 1000 * 60;
        const hourInMilliseconds = minuteInMilliseconds * 60;
        const dayInMilliseconds = hourInMilliseconds * 24;
        const weekInMilliseconds = dayInMilliseconds * 7;

        if (timeDifference < hourInMilliseconds) {
            const minutesDifference = Math.floor(timeDifference / minuteInMilliseconds);
            return `${minutesDifference}m ago`;
        } else if (timeDifference < dayInMilliseconds) {
            const hoursDifference = Math.floor(timeDifference / hourInMilliseconds);
            return `${hoursDifference}h ago`;
        } else if (timeDifference > weekInMilliseconds) {
            const day = dateObject.getDate();
            const month = dateObject.getMonth() + 1;
            return `${month}-${day}`;
        } else {
            const daysDifference = Math.floor(timeDifference / dayInMilliseconds);
            return `${daysDifference}d ago`;
        }
    }
    function createCommentElement(comment) {
        const updateTimeDifference = formatTimeDifference(comment.createdAt);

        const commentDiv = document.createElement('div');
        commentDiv.classList.add("tiktok-1i7ohvi-DivCommentItemContainer");

        commentDiv.innerHTML = `
        <div class="tiktok-ulyotp-DivCommentContentContainer e1g2efjf0">
            <a data-e2e="comment-avatar-1" class="e1g2efjf5 tiktok-1jatens-StyledLink-StyledUserLinkAvatar er1vbsz0" href="/@${comment.customer.username}" style="flex: 0 0 40px;">
                <span shape="circle" data-e2e="" class="tiktok-tuohvl-SpanAvatarContainer e1e9er4e0" style="width: 40px; height: 40px;">
                    <img loading="lazy" alt="" src="${comment.customer.logo}" class="tiktok-1zpj2q-ImgAvatar">
                </span>
            </a>
            <div class="tiktok-1mf23fd-DivContentContainer e1g2efjf1">
                <a class="e1g2efjf4 tiktok-fx1avz-StyledLink-StyledUserLinkName er1vbsz0" href="/@${comment.customer.username}">
                    <span data-e2e="comment-username-1" class="tiktok-1665s4c-SpanUserNameText e1g2efjf3">${comment.customer.name}</span>
                </a>
                <p data-e2e="comment-level-1" class="tiktok-xm2h10-PCommentText e1g2efjf6">
                    <span dir="">${comment.text}</span>
                </p>
                <p class="tiktok-1sun2p5-PCommentSubContent e1g2efjf9">
                    <span data-e2e="comment-time-1" class="tiktok-4tru0g-SpanCreatedTime e1g2efjf8">${updateTimeDifference}</span>
                    <span aria-label="Reply" role="button" data-e2e="comment-reply-1" tabindex="0" class="tiktok-ro5z69-SpanReplyButton e1g2efjf10">Reply</span>
                </p>
            </div>
            <div class="tiktok-1swe2yf-DivActionContainer esns4rh0">
                <div aria-label="more" role="button" tabindex="0" class="tiktok-5g6iif-DivMoreContainer esns4rh1">
                    <div data-e2e="comment-more-icon">
                        <svg class="tiktok-fzlfzu-StyledMoreIcon esns4rh2" width="1em" data-e2e="" height="1em" viewBox="0 0 48 48" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M4 24C4 21.7909 5.79086 20 8 20C10.2091 20 12 21.7909 12 24C12 26.2091 10.2091 28 8 28C5.79086 28 4 26.2091 4 24ZM20 24C20 21.7909 21.7909 20 24 20C26.2091 20 28 21.7909 28 24C28 26.2091 26.2091 28 24 28C21.7909 28 20 26.2091 20 24ZM36 24C36 21.7909 37.7909 20 40 20C42.2091 20 44 21.7909 44 24C44 26.2091 42.2091 28 40 28C37.7909 28 36 26.2091 36 24Z">
                            </path>
                        </svg>
                    </div>
                </div>
                <div aria-label="Like video {number} likes" aria-pressed="false" role="button" tabindex="0" class="tiktok-114tc9h-DivLikeWrapper ezxoskx0">
                    <div data-e2e="comment-like-icon" class="tiktok-1tvtgfz-DivLikeIcon ezxoskx2">
                        <svg width="20" data-e2e="" height="20" viewBox="0 0 48 48" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M24 9.01703C19.0025 3.74266 11.4674 3.736 6.67302 8.56049C1.77566 13.4886 1.77566 21.4735 6.67302 26.4016L22.5814 42.4098C22.9568 42.7876 23.4674 43 24 43C24.5326 43 25.0432 42.7876 25.4186 42.4098L41.327 26.4016C46.2243 21.4735 46.2243 13.4886 41.327 8.56049C36.5326 3.736 28.9975 3.74266 24 9.01703ZM21.4938 12.2118C17.9849 8.07195 12.7825 8.08727 9.51028 11.3801C6.16324 14.7481 6.16324 20.214 9.51028 23.582L24 38.1627L38.4897 23.582C41.8368 20.214 41.8368 14.7481 38.4897 11.3801C35.2175 8.08727 30.0151 8.07195 26.5062 12.2118L26.455 12.2722L25.4186 13.3151C25.0432 13.6929 24.5326 13.9053 24 13.9053C23.4674 13.9053 22.9568 13.6929 22.5814 13.3151L21.545 12.2722L21.4938 12.2118Z">
                            </path>
                        </svg>
                    </div>
                    <span data-e2e="comment-like-count" class="tiktok-gb2mrc-SpanCount ezxoskx3" style="margin-left: 0px; margin-right: 0px;">0</span>
                </div>
            </div>
        </div>
    `;

        return commentDiv;
    }
    function handleFollowDetail(userId, followButton, changeButton) {
        let mainDiv = document.querySelector('.tiktok-85dfh6-DivInfoContainer')
        let childNodes = mainDiv.childNodes;
        if (userId === customer.id) {
            childNodes[3].innerHTML = `
                <div data-e2e="video-setting" class="css-1dcgmzm-DivActionContainer e161jvwg0"><svg
        class="css-1xafdg4-StyledEllipsisHorizontal e161jvwg1" width="1em" data-e2e="" height="1em" viewBox="0 0 48 48"
        fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd"
            d="M4 24C4 21.7909 5.79086 20 8 20C10.2091 20 12 21.7909 12 24C12 26.2091 10.2091 28 8 28C5.79086 28 4 26.2091 4 24ZM20 24C20 21.7909 21.7909 20 24 20C26.2091 20 28 21.7909 28 24C28 26.2091 26.2091 28 24 28C21.7909 28 20 26.2091 20 24ZM36 24C36 21.7909 37.7909 20 40 20C42.2091 20 44 21.7909 44 24C44 26.2091 42.2091 28 40 28C37.7909 28 36 26.2091 36 24Z">
        </path>
    </svg></div>
                `

        } else {
            if (followedSet.has(userId)) {
                followButton.classList = "tiktok-2cfmui-Button";
                changeButton.innerHTML = "Following";
            } else {
                followButton.classList = "tiktok-1pcikqk-Button";
                changeButton.innerHTML = "Follow";
            }
        }
    }
    async function updateVideoDetails(video, commentsCountElement, likeCountElement, commentCountElement, usernameElement, nameElement, daysDifferenceElement, updateTimeDifference, captionElement, avatarImage, videoThumbnail, videoPlay, svgIcon) {
        const replaceHashtagsWithLinks = (match, p1) => {
            const foundHashtag = video.hashtags.find(hashtag => hashtag.name === p1);
            if (foundHashtag) {
                return `<a data-e2e="search-common-link" target="_self" rel="opener"
                 class="css-g8ml1x-StyledLink-StyledCommonLink"  
                 href="/hashtag/${foundHashtag.name}/videos"><strong color="rgba(43, 93, 185, 1)" 
                 class="css-1p6dp51-StrongText">#${foundHashtag.name} </strong></a>`;
            }
            return match;
        };

        const resultCaptionWithLinks = video.caption.replace(/#(\w+)/g, replaceHashtagsWithLinks);

        commentsCountElement.textContent = `Comments (${video.comments.length})`;
        likeCountElement.textContent = video.likes;
        commentCountElement.textContent = video.comments.length;
        usernameElement.textContent = video.user.username;
        nameElement.textContent = video.user.name;
        daysDifferenceElement.textContent = updateTimeDifference;
        captionElement.innerHTML = resultCaptionWithLinks;
        avatarImage.src = `${video.user.logo}`;
        videoThumbnail.src = `${video.thumbnail}`;
        videoPlay.src = `${video.video}`;
        svgIcon.setAttribute('fill', 'rgba(22, 24, 35)');
    }
    async function updateVideoDetailsNotSouce(video, commentsCountElement, likeCountElement, commentCountElement, usernameElement, nameElement, daysDifferenceElement, updateTimeDifference, captionElement, avatarImage, videoThumbnail) {
        const replaceHashtagsWithLinks = (match, p1) => {
            const foundHashtag = video.hashtags.find(hashtag => hashtag.name === p1);
            if (foundHashtag) {
                return `<a data-e2e="search-common-link" target="_self" rel="opener"
                 class="css-g8ml1x-StyledLink-StyledCommonLink"  
                 href="/hashtag/${foundHashtag.name}/videos"><strong color="rgba(43, 93, 185, 1)" 
                 class="css-1p6dp51-StrongText">#${foundHashtag.name} </strong></a>`;
            }
            return match;
        };

        const resultCaptionWithLinks = video.caption.replace(/#(\w+)/g, replaceHashtagsWithLinks);
        commentsCountElement.textContent = `Comments (${video.comments.length})`;
        likeCountElement.textContent = video.likes;
        commentCountElement.textContent = video.comments.length;
        usernameElement.textContent = video.user.username;
        nameElement.textContent = video.user.name;
        daysDifferenceElement.textContent = updateTimeDifference;
        captionElement.innerHTML = resultCaptionWithLinks;
        avatarImage.src = `${video.user.logo}`;
        videoThumbnail.src = `${video.thumbnail}`;
    }
    function handleLikeDetail(videoId, svgIcon) {
        if (likedVideoSet.has(videoId)) {
            svgIcon.setAttribute('fill', 'rgba(254, 44, 85)');
        }
    }
    function updateVideoDataAtIndex(indexToModify, newData) {
        const currentVideosData = JSON.parse(sessionStorage.getItem('videosData')) || [];
        currentVideosData[indexToModify] = newData;
        videos = currentVideosData
        sessionStorage.setItem('videosData', JSON.stringify(currentVideosData));
    }
    function handleVisibilityEvent(videoPlay, playIcon) {
        document.hidden ? videoPlay.pause() : playIcon.style.display === 'none' ? videoPlay.play() : videoPlay.pause()
    }
    function updateLeftArrowDisplay(indexCurrent, leftArrow) {
        if (indexCurrent === '0' || !indexCurrent) {
            leftArrow.style.display = "none";
        } else {
            leftArrow.style.display = "flex";
        }
    }
    function updateCustomer() {
        socket.emit('updateCustomer', { id: customer.id }, (data) => console.log(data));

        socket.on('updateCustomer', (data) => {
            customer = data;
            likedVideoIds = customer.liked_videos;
            likedVideoSet = new Set(likedVideoIds.map(video => video.id));
            followedSet = new Set(customer.following.map(following => following.id));
        });
    }
    function updateVideo(video) {
        return new Promise((resolve, reject) => {
            socket.emit('updateVideo', { id: video.id }, (data) => {
                resolve(data.video);
            });

            socket.on('updateVideo', (data) => {
                resolve(data.video);
            });
        });
    }
    function removeCommentContainers() {
        const commentContainers = document.querySelectorAll('.tiktok-1i7ohvi-DivCommentItemContainer');
        commentContainers.forEach(commentContainer => {
            commentContainer.remove();
        });
    }
    function appendCommentsToContainer(video, comments, container, divBottomCommentContainer) {
        comments.forEach(comment => {
            const commentElement = createCommentElement(comment);
            container.appendChild(commentElement);
        });
        if (!video.allow_comment) {
            divBottomCommentContainer.style.display = 'none'
        } else {
            divBottomCommentContainer.style.display = 'block'
        }
    }
    function updateVideoURL(url, type) {
        if (type === 'push') {
            window.history.pushState({}, "", url);
        } else {
            window.history.replaceState({}, "", url);
        }
    }

    function createVideoContainer() {
        const divVideo = document.createElement('div');
        divVideo.classList = "tiktok-1qg2388-DivBrowserModeContainer"
        divVideo.style.display = "flex";
        divVideo.innerHTML = `
    <div class="tiktok-1tunefa-DivVideoContainer e11s2kul23">
        <div class="tiktok-zqqb1u-DivSearchBarContainer e11s2kul27">
            <div class="tiktok-1vve6pb-DivSearchBarBackground e11s2kul28"></div>
            <div class="tiktok-1s4i1zx-DivSearchFormContainer e1hi1cmj0">
                <form data-e2e="search-box" class="search-input tiktok-mebjpe-FormElement e14ntknm0" action="/search">
                    <input placeholder="Find related content" name="q" type="search" autocomplete="off" role="combobox"
                        aria-controls="" aria-label="Find related content" aria-expanded="false"
                        aria-autocomplete="list" data-e2e="search-user-input"
                        class="tiktok-1a4jouy-InputElement e14ntknm3" value=""><span
                        class="tiktok-v2cms4-SpanSpliter e14ntknm6"></span><button data-e2e="search-box-button"
                        type="submit" aria-label="Search" class="tiktok-16dy42q-ButtonSearch e14ntknm7">
                        <div class="tiktok-17iic05-DivSearchIconContainer e14ntknm8"><svg width="24" data-e2e=""
                                height="24" viewBox="0 0 48 48" fill="rgba(255, 255, 255, .75)"
                                xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd"
                                    d="M22 10C15.3726 10 10 15.3726 10 22C10 28.6274 15.3726 34 22 34C28.6274 34 34 28.6274 34 22C34 15.3726 28.6274 10 22 10ZM6 22C6 13.1634 13.1634 6 22 6C30.8366 6 38 13.1634 38 22C38 25.6974 36.7458 29.1019 34.6397 31.8113L43.3809 40.5565C43.7712 40.947 43.7712 41.5801 43.3807 41.9705L41.9665 43.3847C41.5759 43.7753 40.9426 43.7752 40.5521 43.3846L31.8113 34.6397C29.1019 36.7458 25.6974 38 22 38C13.1634 38 6 30.8366 6 22Z">
                                </path>
                            </svg></div>
                    </button>
                    <div class="tiktok-zs9tvf-DivBrowserModeInputBorder e14ntknm2"></div>
                </form>
            </div>
        </div>
        <div class="tiktok-xhj3u2-StyledVideoBlurBackground"><span
                style="box-sizing: border-box; display: block; overflow: hidden; width: initial; height: initial; background: none; opacity: 1; border: 0px; margin: 0px; padding: 0px; position: absolute; inset: 0px;">
                <picture>
                    <source type="image/avif">
                    <img loading="lazy" decoding="async" imagex-type="react" imagex-version="0.3.7"
                        style="position: absolute; inset: 0px; box-sizing: border-box; padding: 0px; border: none; margin: auto; display: block; width: 0px; height: 0px; min-width: 100%; max-width: 100%; min-height: 100%; max-height: 100%;">
                </picture>
            </span></div>
        <div class="tiktok-15ggvmu-DivVideoWrapper e11s2kul4">
            <div mode="2" class="tiktok-1jxhpnd-DivContainer e1yey0rl0">
                <div data-e2e="browse-video" class="tiktok-8lv75m-DivBasicPlayerWrapper e1yey0rl2">
                    <div id="xgwrapper-2-7273303434869198082" class="tiktok-web-player no-controls"
                        style="width: 100%; height: 100%;"><video playsinline="" preload="auto" crossorigin="anonymous"
                            style="width: 100%; height: 100%;" autoplay loop></video>
                    </div>
                </div>
            </div>
            <div class="tiktok-1nzcgaf-DivVideoControlContainer e1rpry1m5">
                <div class="tiktok-bo5mth-DivSeekBarContainer e1rpry1m0">
                    <div tabindex="0" role="slider" aria-label="progress bar" aria-valuenow="0.06664748657233444"
                        aria-valuetext="00:00" class="tiktok-1972tl1-DivSeekBarProgress e1rpry1m2"></div>
                    <div class="tiktok-1ioucls-DivSeekBarCircle e1rpry1m4" style="left: calc(6.66475%);"></div>
                    <div class="tiktok-kqqewi-DivSeekBar e1rpry1m3"
                        style="transform: scaleX(0.0666475) translateY(-50%);"></div>
                </div>
                <div class="tiktok-o2z5xv-DivSeekBarTimeContainer e1rpry1m1">00:00/00:14</div>
            </div>
            <div class="tiktok-mzxtw3-DivVideoControlTop e1rpry1m7"></div>
            <div class="tiktok-1ap2cv9-DivVideoControlBottom e1rpry1m6"></div>
        </div><svg id="playIcon" style="display:none" xmlns="http://www.w3.org/2000/svg" width="70" height="70"
            fill="#fff" data-e2e="browse-video-play" class="tiktok-196swoi-StyledPlayIcon e11s2kul5">
            <use xlink:href="#Play_Fill-6957a00f"></use>
        </svg><button role="button" aria-label="Close" data-e2e="browse-close"
            class="tiktok-yg0pvs-ButtonBasicButtonContainer-StyledCloseIconContainer e11s2kul7"><svg width="18"
                data-e2e="" height="18" viewBox="0 0 9 10" fill="#fff" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M1.35299 0.792837L4.49961 3.93944L7.64545 0.792566C7.8407 0.597249 8.15733 0.597223 8.35262 0.792508L8.70669 1.14658C8.90195 1.34184 8.90195 1.65842 8.70669 1.85368L5.56027 5.0001L8.70672 8.14655C8.90198 8.34181 8.90198 8.65839 8.70672 8.85366L8.35316 9.20721C8.1579 9.40247 7.84132 9.40247 7.64606 9.20721L4.49961 6.06076L1.35319 9.20719C1.15793 9.40245 0.841345 9.40245 0.646083 9.20719L0.292629 8.85373C0.0973708 8.65847 0.0973653 8.3419 0.292617 8.14664L3.43895 5.0001L0.292432 1.85357C0.0972034 1.65834 0.0971656 1.34182 0.292347 1.14655L0.645801 0.792924C0.841049 0.597582 1.1577 0.597543 1.35299 0.792837Z">
                </path>
            </svg></button>
        <div class="tiktok-oit0gv-DivVoiceControlContainer e11s2kul22"><button tabindex="0" role="button"
                aria-label="Volume" data-e2e="browse-sound" class="tiktok-6mttet-ButtonVoiceControlNew e11s2kul21">
                <svg width="40" data-e2e="" height="40" viewBox="0 0 48 48" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <circle cx="24" cy="24" r="24"></circle>
                    <path fill-rule="evenodd" clip-rule="evenodd"
                        d="M21 16.9118C21 15.2513 20.8942 15.0909 20.709 15.0221C20.5238 14.9763 20.3122 14.9992 20.1799 15.1138L15.0741 19.5258H11.4762C11.2116 19.5258 11 19.7092 11 19.9384V28.084C11 28.3132 11.2116 28.4965 11.4762 28.4965H15.0741L20.1799 32.8862C20.3122 33.0008 20.5238 33.0237 20.709 32.9779C20.8942 32.9091 21 32.7487 21 32.5882V16.9118Z"
                        fill="white"></path>
                    <path
                        d="M30.6653 15C32.7348 17.2304 34.0001 20.2174 34.0001 23.5C34.0001 26.7826 32.7348 29.7696 30.6653 32"
                        stroke="white" stroke-width="2.5" stroke-linecap="round"></path>
                    <path
                        d="M26.8799 17.8833C28.1994 19.381 28.9999 21.347 28.9999 23.5C28.9999 25.653 28.1994 27.6191 26.8799 29.1168"
                        stroke="white" stroke-width="2.5" stroke-linecap="round">
                    </path>
                </svg></button></div>
        <button data-e2e="arrow-left" role="button" aria-label="Go to previous video"
            class="tiktok-1w6o9i7-ButtonBasicButtonContainer-StyledVideoSwitch"><svg width="26" data-e2e="" height="26"
                viewBox="0 0 48 48" fill="#fff" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd"
                    d="M34.4142 22.5858L18.1213 6.29289C17.7308 5.90237 17.0976 5.90237 16.7071 6.29289L15.2929 7.70711C14.9024 8.09763 14.9024 8.7308 15.2929 9.12132L30.1716 24L15.2929 38.8787C14.9024 39.2692 14.9024 39.9024 15.2929 40.2929L16.7071 41.7071C17.0976 42.0976 17.7308 42.0976 18.1213 41.7071L34.4142 25.4142C35.1953 24.6332 35.1953 23.3668 34.4142 22.5858Z">
                </path>
            </svg></button><button data-e2e="arrow-right" role="button" aria-label="Go to next video"
            class="tiktok-1s9jpf8-ButtonBasicButtonContainer-StyledVideoSwitch"><svg width="26" data-e2e="" height="26"
                viewBox="0 0 48 48" fill="#fff" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd"
                    d="M34.4142 22.5858L18.1213 6.29289C17.7308 5.90237 17.0976 5.90237 16.7071 6.29289L15.2929 7.70711C14.9024 8.09763 14.9024 8.7308 15.2929 9.12132L30.1716 24L15.2929 38.8787C14.9024 39.2692 14.9024 39.9024 15.2929 40.2929L16.7071 41.7071C17.0976 42.0976 17.7308 42.0976 18.1213 41.7071L34.4142 25.4142C35.1953 24.6332 35.1953 23.3668 34.4142 22.5858Z">
                </path>
            </svg></button>
        <div tabindex="0" data-e2e="browse-ellipsis" class="tiktok-q969e7-DivIconWrapper e11s2kul18"><svg
                xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor">
                <use xlink:href="#Ellipsis_Horizontal_Fill-9ee69fcf"></use>
            </svg></div>
    </div>
    <div class="tiktok-1qjw4dg-DivContentContainer e1mecfx00">
        <div data-e2e="search-comment-container" class="tiktok-13if7zh-DivCommentContainer ekjxngi0">
            <div class="tiktok-1qp5gj2-DivCommentListContainer">
                <div class="tiktok-1xlna7p-DivProfileWrapper ekjxngi4">
                    <div class="tiktok-pcqxr7-DivDescriptionContentWrapper e1mecfx011">
                        <div class="tiktok-85dfh6-DivInfoContainer evv7pft0"><a rel="opener" target="_self"
                                data-e2e="browse-user-avatar" class="evv7pft8 tiktok-1fng5o0-StyledLink er1vbsz0"
                                href="">
                                <div class="tiktok-uha12h-DivContainer" style="width: 40px; height: 40px;">
                                    <span shape="circle" data-e2e=""
                                        class="tiktok-gcksof-SpanAvatarContainer-StyledAvatar"
                                        style="width: 40px; height: 40px;"><img loading="lazy" alt="" src=""
                                            class="tiktok-1zpj2q-ImgAvatar">
                                    </span>
                                </div>
                            </a><a target="_self" rel="opener" class="tiktok-n2qh4e-StyledLink-StyledLink" href=""><span
                                    data-e2e="browse-username" class="tiktok-1c7urt-SpanUniqueId"><span
                                        class="tiktok-pocgy1-SpanEllipsis"></span></span><br><span
                                    data-e2e="browser-nickname" class="tiktok-gg0x0w-SpanOtherInfos"><span
                                        class="tiktok-pocgy1-SpanEllipsis"></span><span style="margin: 0px 4px;"> ·
                                    </span><span></span></span></a>
                            <div data-e2e="browse-follow" class="tiktok-r4iroe-DivBtnWrapper"><button
                                    class="tiktok-1pcikqk-Button">
                                    <div class="tiktok-jp3752-ButtonContent e1v8cfre2">
                                        <div class="tiktok-1djnsui-ButtonLabel e1v8cfre3">Follow</div>
                                    </div>
                                </button></div>
                        </div>
                        <div class="tiktok-1nst91u-DivMainContent e1mecfx01">
                            <div class="tiktok-bs495z-DivWrapper e1mzilcj0">
                                <div class="tiktok-1rhses0-DivText e1mzilcj1" style="max-height: unset;">
                                    <div class="tiktok-mokgbx-DivBtnWrapper e1mzilcj4"><button type="button"
                                            class="tiktok-1r94cis-ButtonExpand e1mzilcj2">more</button></div>
                                    <div class=" tiktok-1d7krfw-DivOverflowContainer e1mzilcj5">
                                        <div data-e2e="browse-video-desc" class="tiktok-1wdx3tj-DivContainer ejg0rhn0">
                                            <span class="tiktok-j2a19r-SpanText efbd9f0"></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <h4 data-e2e="browse-music" class="tiktok-17nfpht-H4Link epjbyn0"><a target="_self"
                                    rel="opener" class="epjbyn1 tiktok-v80f7r-StyledLink-StyledLink er1vbsz0"
                                    aria-label="" href=""><svg xmlns="http://www.w3.org/2000/svg" width="1em"
                                        height="1em" fill="rgba(22, 24, 35, 1)" styleType="1"
                                        class="tiktok-ftrwfo-MusicNoteIcon epjbyn4">
                                        <use xlink:href="#Music_Note-8c658968"></use>
                                    </svg>
                                    <div class="tiktok-pvx3oa-DivMusicText epjbyn3">original sound - 🍪</div>
                                </a></h4>

                        </div>
                    </div>
                    <div class="tiktok-hlg65e-DivMainContent">
                        <div class="tiktok-184umhf-DivContainer">
                            <div class="tiktok-1452egd-DivFlexCenterRow-StyledWrapper">
                                <div class="tiktok-1d39a26-DivFlexCenterRow">
                                    <button type="button" aria-label="30.6K fixed_likes" aria-pressed="false"
                                        class="tiktok-xakz2y-ButtonActionItem e1hk3hf90"><span
                                            data-e2e="browse-like-icon"
                                            class="tiktok-3ahw3w-SpanIconWrapper e1hk3hf91"><svg
                                                xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                                                <use xlink:href="#heart-fill-03bd63df"></use>
                                            </svg></span><strong data-e2e="browse-like-count"
                                            class="tiktok-w1dlre-StrongText e1hk3hf92"></strong></button>
                                    <button type="button" disabled=""
                                        class="tiktok-xakz2y-ButtonActionItem e1hk3hf90"><span
                                            data-e2e="browse-comment-icon" class="tiktok-3ahw3w-SpanIconWrapper">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                                fill="currentColor">
                                                <use xlink:href="#Bubble_Ellipsis_Right_Fill-a497dc09"></use>
                                            </svg></span>
                                        <strong data-e2e="browse-comment-count"
                                            class="tiktok-w1dlre-StrongText"></strong></button>
                                </div>
                                <div data-e2e="browse-share-group" class="tiktok-1d39a26-DivFlexCenterRow ehlq8k31"><a
                                        id="icon-element-embed" mode="0" href="#" data-e2e="video-share-embed"
                                        aria-label="Embed" class="tiktok-vy3jtp-AShareLink e15mchsh0"><svg width="24"
                                            data-e2e="" height="24" viewBox="0 0 24 24" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path fill-rule="evenodd" clip-rule="evenodd"
                                                d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z"
                                                fill="#161823" fill-opacity="0.75"></path>
                                            <path fill-rule="evenodd" clip-rule="evenodd"
                                                d="M12.313 7.96568C12.3665 7.65966 12.658 7.45498 12.964 7.50851C13.27 7.56203 13.4747 7.8535 13.4211 8.15951L12.0506 15.9952C11.997 16.3012 11.7056 16.5059 11.3996 16.4523C11.0936 16.3988 10.8889 16.1073 10.9424 15.8013L12.313 7.96568ZM16.2402 8.77448C15.96 8.48453 15.5058 8.48453 15.2256 8.77448C14.9454 9.06443 14.9454 9.53454 15.2256 9.82449L17.454 12.1307L15.2262 14.4364C14.946 14.7263 14.946 15.1964 15.2262 15.4864C15.5063 15.7763 15.9606 15.7763 16.2407 15.4864L19.4551 12.1598C19.4704 12.1439 19.4704 12.1182 19.4551 12.1023L19.2233 11.8623L19.2201 11.8586L19.2158 11.854L16.2402 8.77448ZM8.88972 15.4867C8.59977 15.7766 8.12966 15.7766 7.83971 15.4867L5.4207 13.0677L4.76017 12.4071L4.51191 12.1589C4.49603 12.143 4.49603 12.1173 4.51191 12.1014L7.83853 8.77477C8.12848 8.48482 8.59859 8.48482 8.88854 8.77477C9.17849 9.06472 9.17849 9.53482 8.88854 9.82478L6.58318 12.1301L8.88972 14.4367C9.17967 14.7266 9.17967 15.1967 8.88972 15.4867Z"
                                                fill="white"></path>
                                        </svg></a><a id="icon-element-message" mode="0" href="#"
                                        data-e2e="video-share-message" aria-label="Send to friends"
                                        class="tiktok-vy3jtp-AShareLink e15mchsh0"><svg width="24" data-e2e=""
                                            height="24" viewBox="0 0 24 24" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path fill-rule="evenodd" clip-rule="evenodd"
                                                d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z"
                                                fill="#FE2C55"></path>
                                            <path fill-rule="evenodd" clip-rule="evenodd"
                                                d="M18.7913 7.1875C18.6796 6.99413 18.4733 6.875 18.25 6.875H5.75001C5.50258 6.875 5.27845 7.02097 5.17839 7.24727C5.07834 7.47356 5.1212 7.73758 5.28771 7.9206L8.55021 11.5065C8.72305 11.6965 8.9945 11.7614 9.23456 11.6702L13.7656 9.94799C13.8184 9.92795 13.8423 9.93624 13.8527 9.94039C13.871 9.94765 13.8971 9.96649 13.9177 10.0013C13.9382 10.0361 13.9421 10.0681 13.9396 10.0876C13.9382 10.0987 13.9339 10.1237 13.8909 10.1602L10.1707 13.3155C9.97902 13.4782 9.90339 13.7398 9.97878 13.9796L11.4038 18.5124C11.4781 18.749 11.6853 18.9192 11.9317 18.9463C12.1781 18.9734 12.4173 18.8522 12.5413 18.6375L18.7913 7.81251C18.9029 7.61913 18.9029 7.38088 18.7913 7.1875Z"
                                                fill="white"></path>
                                        </svg></a><a id="icon-element-facebook" mode="0" href="" target="_blank"
                                        rel="noopener noreferrer" data-e2e="video-share-facebook"
                                        aria-label="Share to Facebook" class="tiktok-vy3jtp-AShareLink e15mchsh0"><svg
                                            width="24" data-e2e="" height="24" viewBox="0 0 48 48" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M24 47C36.7025 47 47 36.7025 47 24C47 11.2975 36.7025 1 24 1C11.2975 1 1 11.2975 1 24C1 36.7025 11.2975 47 24 47Z"
                                                fill="white"></path>
                                            <path
                                                d="M24 1C11.2964 1 1 11.2964 1 24C1 35.4775 9.40298 44.9804 20.3846 46.7205L20.3936 30.6629H14.5151V24.009H20.3936C20.3936 24.009 20.3665 20.2223 20.3936 18.5363C20.4206 16.8503 20.7542 15.2274 21.6288 13.7487C22.9722 11.4586 25.0639 10.3407 27.6335 10.0251C29.7432 9.76362 31.826 10.0521 33.9087 10.3407C34.0529 10.3587 34.125 10.3767 34.2693 10.4038C34.2693 10.4038 34.2783 10.6472 34.2693 10.8005C34.2603 12.4053 34.2693 16.0839 34.2693 16.0839C33.2685 16.0659 31.6096 15.9667 30.5096 16.138C28.6884 16.4175 27.6425 17.5806 27.6064 19.4108C27.5704 20.8354 27.5884 24.009 27.5884 24.009H33.9988L32.962 30.6629H27.5974V46.7205C38.597 44.9984 47.009 35.4775 47.009 24C47 11.2964 36.7036 1 24 1Z"
                                                fill="#0075FA"></path>
                                        </svg></a><a id="icon-element-whatsapp" mode="0" href="" target="_blank"
                                        rel="noopener noreferrer" data-e2e="video-share-whatsapp"
                                        aria-label="Share to WhatsApp" class="tiktok-vy3jtp-AShareLink e15mchsh0"><svg
                                            width="24" data-e2e="" height="24" viewBox="0 0 48 48" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path fill-rule="evenodd" clip-rule="evenodd"
                                                d="M24 47C36.7025 47 47 36.7025 47 24C47 11.2975 36.7025 1 24 1C11.2975 1 1 11.2975 1 24C1 36.7025 11.2975 47 24 47Z"
                                                fill="#25D366"></path>
                                            <path fill-rule="evenodd" clip-rule="evenodd"
                                                d="M30.9028 25.6129C30.5802 25.4515 28.9944 24.6713 28.6988 24.5635C28.4031 24.4559 28.1881 24.4021 27.9731 24.7249C27.758 25.0478 27.1399 25.7744 26.9517 25.9897C26.7636 26.2049 26.5754 26.2319 26.2529 26.0704C25.9303 25.909 24.891 25.5684 23.659 24.4694C22.7002 23.6141 22.0528 22.5579 21.8647 22.235C21.6765 21.9121 21.8446 21.7375 22.0061 21.5767C22.1512 21.4321 22.3287 21.2 22.4899 21.0116C22.6512 20.8233 22.705 20.6887 22.8125 20.4735C22.92 20.2582 22.8663 20.0699 22.7855 19.9085C22.7049 19.747 22.0599 18.1593 21.7911 17.5134C21.5293 16.8845 21.2634 16.9697 21.0654 16.9598C20.8774 16.9504 20.6622 16.9484 20.4472 16.9484C20.2322 16.9484 19.8827 17.0291 19.587 17.352C19.2914 17.6749 18.4581 18.4553 18.4581 20.0428C18.4581 21.6306 19.6139 23.1643 19.7752 23.3795C19.9365 23.5949 22.0496 26.8528 25.2853 28.2499C26.0548 28.5823 26.6557 28.7807 27.1241 28.9293C27.8968 29.1749 28.5999 29.1402 29.1557 29.0572C29.7754 28.9646 31.064 28.277 31.3328 27.5235C31.6016 26.7699 31.6016 26.1242 31.521 25.9897C31.4404 25.8551 31.2253 25.7744 30.9028 25.6129ZM25.0178 33.6472H25.0134C23.0881 33.6465 21.1998 33.1292 19.5524 32.1517L19.1606 31.9191L15.0998 32.9844L16.1837 29.0251L15.9286 28.6191C14.8546 26.9109 14.2873 24.9365 14.2881 22.9091C14.2905 16.9934 19.1037 12.1805 25.022 12.1805C27.8879 12.1815 30.5817 13.299 32.6076 15.3271C34.6333 17.3551 35.7482 20.0509 35.7471 22.9178C35.7447 28.8339 30.9315 33.6472 25.0178 33.6472ZM34.1489 13.7858C31.7117 11.3458 28.4706 10.0014 25.0173 10C17.902 10 12.111 15.7906 12.1082 22.908C12.1073 25.1832 12.7017 27.4039 13.8313 29.3617L12 36.0509L18.8432 34.2559C20.7287 35.2843 22.8516 35.8264 25.0121 35.827H25.0174H25.0174C32.132 35.827 37.9234 30.0359 37.9263 22.9184C37.9276 19.4691 36.5861 16.2258 34.1489 13.7858Z"
                                                fill="white"></path>
                                        </svg></a><a id="icon-element-twitter" mode="0" href="" target="_blank"
                                        rel="noopener noreferrer" data-e2e="video-share-twitter"
                                        aria-label="Share to Twitter" class="tiktok-vy3jtp-AShareLink e15mchsh0"><svg
                                            width="24" data-e2e="" height="24" viewBox="0 0 48 48" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path fill-rule="evenodd" clip-rule="evenodd"
                                                d="M24.0002 47.001C36.7028 47.001 47.0002 36.7035 47.0002 24.001C47.0002 11.2984 36.7028 1.00098 24.0002 1.00098C11.2977 1.00098 1.00024 11.2984 1.00024 24.001C1.00024 36.7035 11.2977 47.001 24.0002 47.001Z"
                                                fill="#1DA1F2"></path>
                                            <path fill-rule="evenodd" clip-rule="evenodd"
                                                d="M38.2029 13.5327C37.3894 14.0824 35.5215 14.8813 34.6003 14.8813V14.8829C33.5484 13.7237 32.0675 13 30.4252 13C27.2353 13 24.6488 15.7287 24.6488 19.0925C24.6488 19.5598 24.7001 20.0157 24.795 20.4529H24.794C20.4671 20.3331 15.7348 18.0452 12.886 14.1294C11.1344 17.3277 12.6501 20.8848 14.6378 22.1809C13.9574 22.235 12.7049 22.0982 12.1153 21.4913C12.0758 23.6142 13.0434 26.4269 16.5714 27.4473C15.8919 27.8329 14.6892 27.7223 14.1662 27.6402C14.3497 29.4322 16.7285 31.775 19.3297 31.775C18.4026 32.9063 14.9144 34.9582 11 34.3054C13.6584 36.0118 16.7568 37 20.0362 37C29.3556 37 36.5929 29.0322 36.2034 19.2027C36.2019 19.1919 36.2019 19.1811 36.2009 19.1693C36.2019 19.144 36.2034 19.1187 36.2034 19.0925C36.2034 19.0619 36.2009 19.0331 36.2 19.0035C37.0484 18.3914 38.1868 17.3087 39 15.8836C38.5284 16.1577 37.1134 16.7064 35.7968 16.8426C36.6418 16.3615 37.8937 14.7858 38.2029 13.5327Z"
                                                fill="white"></path>
                                        </svg></a><button aria-expanded="false" aria-label="Share"
                                        class="tiktok-eu9eez-ButtonShare ehlq8k37"><svg width="16" data-e2e=""
                                            height="16" viewBox="0 0 48 48" fill="currentColor"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path fill-rule="evenodd" clip-rule="evenodd"
                                                d="M26.4588 3.90871C25.3403 2.86068 23.4902 3.64074 23.4902 5.16041V13.0502C20.4499 14.1752 11.3194 18.1407 6.6047 26.6176C-1.49677 42.1311 3.82522 43.478 5.77105 39.7411C13.2467 29.1857 20.8146 30.4298 23.4902 31.3209V38.2274C23.4902 39.7114 25.2658 40.5055 26.4023 39.5298L43.3681 24.9655C44.9268 23.6274 44.9791 21.2608 43.4811 19.8573L26.4588 3.90871Z">
                                            </path>
                                        </svg></button></div>
                            </div>
                            <div class="tiktok-1x3bx1n-DivCopyLinkContainer">
                                <p data-e2e="browse-video-link" class="tiktok-1v8b11s-PCopyLinkText">
                                </p><button data-e2e="browse-copy" class="tiktok-7e23lp-ButtonCopyLink">Copy
                                    link </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="tiktok-h5r7le-DivTabMenuWrapper e1aa9wve4">
                    <div class="tiktok-3yeu18-DivTabMenuContainer e1aa9wve0">
                        <div class="tiktok-97lq0-DivTabItemContainer e1aa9wve1">
                            <div class="tiktok-15wq8g0-DivTabItem"></div>
                        </div>
                        <div class="tiktok-1gy98k0-DivTabItemContainer e1aa9wve1">
                            <div class="tiktok-1iu17z5-DivTabItem e1aa9wve2">Creator videos</div>
                        </div>
                    </div>
                    <div class="tiktok-1vgn7ia-DivBorder e1aa9wve3"></div>
                </div>
            </div>
        </div>
        <div class="tiktok-19hqadz-DivBottomCommentContainer e1mecfx04">
            <div class="tiktok-jvtqsz-DivCommentContainer e1rzzhjk0">
                <div class="tiktok-1vplah5-DivLayoutContainer e1rzzhjk1">
                    <div data-e2e="comment-input" class="tiktok-1un92a9-DivInputAreaContainer e1rzzhjk2">
                        <div data-e2e="comment-text" class="tiktok-qpucp9-DivInputEditorContainer e1rzzhjk3">
                            <div class="tiktok-lso1ai-DivInputAreaContainer e1d90qbv0">
                                <div class="DraftEditor-root">
                                    <div class="public-DraftEditorPlaceholder-root">
                                        <div class="public-DraftEditorPlaceholder-inner" id="placeholder-erend"
                                            style="white-space: pre-wrap;">Add comment...</div>
                                    </div>
                                    <div class="DraftEditor-editorContainer">
                                        <div aria-describedby="placeholder-erend"
                                            class="notranslate public-DraftEditor-content" contenteditable="true"
                                            role="textbox" spellcheck="false"
                                            style="outline: none; user-select: text;  overflow-wrap: break-word;">
                                            <div data-contents="true">
                                                <div class="" data-block="true" data-editor="erend"
                                                    data-offset-key="e9gie-0-0">
                                                    <div data-offset-key="e9gie-0-0">
                                                        <span data-offset-key="e9gie-0-0"><br data-text="true"></span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div aria-label="&quot;@&quot; a user to tag them in your comments" aria-expanded="false"
                            role="button" tabindex="0" data-e2e="comment-at-icon"
                            class="tiktok-1vi8qz3-DivMentionButton e1rzzhjk4"><svg width="1em" data-e2e="" height="1em"
                                viewBox="0 0 48 48" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd"
                                    d="M24 6C14.0589 6 6 14.0589 6 24C6 33.9411 14.0589 42 24 42C28.0553 42 31.7921 40.6614 34.8006 38.401L35.6001 37.8003C36.0416 37.4686 36.6685 37.5576 37.0003 37.9992L38.2016 39.5981C38.5334 40.0397 38.4443 40.6666 38.0028 40.9983L37.2033 41.599C33.5258 44.3619 28.9513 46 24 46C11.8497 46 2 36.1503 2 24C2 11.8497 11.8497 2 24 2C36.1503 2 46 11.8497 46 24V26C46 30.4843 42.1949 34 37.8438 34C35.1966 34 32.8496 32.7142 31.3935 30.733C29.5649 32.7403 26.9303 34 24 34C18.4772 34 14 29.5228 14 24C14 18.4772 18.4772 14 24 14C29.5228 14 34 18.4772 34 24C34 24.5814 33.9502 25.1528 33.8541 25.7096C33.8473 25.8052 33.8438 25.902 33.8438 26C33.8438 28.2091 35.6347 30 37.8438 30C40.1201 30 42 28.1431 42 26V24C42 14.0589 33.9411 6 24 6ZM24 18C20.6863 18 18 20.6863 18 24C18 27.3137 20.6863 30 24 30C26.9395 30 29.3891 27.8841 29.9013 25.0918C29.9659 24.7392 30 24.3744 30 24C30 20.6863 27.3137 18 24 18Z">
                                </path>
                            </svg></div>
                        <div aria-label="Click to add emojis" aria-expanded="false" role="button" tabindex="0"
                            data-e2e="comment-emoji-icon" class="tiktok-1yq6goo-DivEmojiButton e1rzzhjk5"><svg
                                width="1em" data-e2e="" height="1em" viewBox="0 0 48 48" fill="currentColor"
                                xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd"
                                    d="M24 6C14.0589 6 6 14.0589 6 24C6 33.9411 14.0589 42 24 42C33.9411 42 42 33.9411 42 24C42 14.0589 33.9411 6 24 6ZM2 24C2 11.8497 11.8497 2 24 2C36.1503 2 46 11.8497 46 24C46 36.1503 36.1503 46 24 46C11.8497 46 2 36.1503 2 24Z">
                                </path>
                                <path fill-rule="evenodd" clip-rule="evenodd"
                                    d="M17 23C18.6569 23 20 21.2091 20 19C20 16.7909 18.6569 15 17 15C15.3431 15 14 16.7909 14 19C14 21.2091 15.3431 23 17 23Z">
                                </path>
                                <path fill-rule="evenodd" clip-rule="evenodd"
                                    d="M31 23C32.6569 23 34 21.2091 34 19C34 16.7909 32.6569 15 31 15C29.3431 15 28 16.7909 28 19C28 21.2091 29.3431 23 31 23Z">
                                </path>
                                <path fill-rule="evenodd" clip-rule="evenodd"
                                    d="M16 28.3431C16 31.4673 19.5817 36 24 36C28.4183 36 32 31.4673 32 28.3431C32 25.219 16 25.219 16 28.3431Z">
                                </path>
                            </svg></div>
                    </div>
                </div>
                <div aria-disabled="true" aria-label="Post" role="button" tabindex="0" data-e2e="comment-post"
                    class="tiktok-n4wkvf-DivPostButton">Post</div>
            </div>
        </div>
    </div>
    
<div class="css-14feuhu" style="display: none;"><span>
        <div class="css-14feuhu-notice" style="right: 50%;">
            <div class="css-14feuhu-notice-content">
                <div role="alert" class="css-9aj0a0-DivMessageContainer e1wz89c90"
                    style="display: flex; justify-content: center; align-items: center;"><img
                        src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE3Ljg0MDQgNi44NTk4NkMxOC4wMzc3IDYuNjYyMDcgMTguMzU4NyA2LjY2NDI1IDE4LjU1MzMgNi44NjQ3MUwxOS40NTc0IDcuNzk2MjlDMTkuNjQ3NSA3Ljk5MjE3IDE5LjY0NTQgOC4zMDQzMiAxOS40NTI2IDguNDk3NTlMMTAuNTU4MiAxNy40MTYzQzEwLjEwNSAxNy44NzA3IDkuMzczMzMgMTcuODU5NiA4LjkzMzY2IDE3LjM5MTZMNC44MzY4MSAxMy4wMzA2QzQuNjQ5OTEgMTIuODMxNyA0LjY1NzExIDEyLjUxOTYgNC44NTI5OSAxMi4zMjk1TDUuNzgzNzQgMTEuNDI2MUM1Ljk4NDE4IDExLjIzMTUgNi4zMDUxNCAxMS4yMzg5IDYuNDk2MzkgMTEuNDQyNUw5Ljc4MjE0IDE0Ljk0MDFMMTcuODQwNCA2Ljg1OTg2WiIgZmlsbD0iIzBCRTA5QiIvPgo8L3N2Zz4K"
                        aria-hidden="true" style="width: 24px; height: 24px; margin-right: 8px;"><span
                        id="alertMessage">Settings updated
                    </span></div>
            </div>
        </div>
    </span></div>
<div style="display: none;" class="container-unableMuted">
    <div class="unableMuted">
        <button>START!</button>
    </div>
</div>
       `
        return divVideo;
    }
    function createToolThree() {
        const divCustomAlert = document.createElement('div');
        const divUnableVideo = document.createElement('div');
        divCustomAlert.id = "customAlert"
        divCustomAlert.classList = "css-14feuhu"
        divUnableVideo.classList = "container-unableMuted"
        divCustomAlert.style.display = "none";
        divUnableVideo.style.display = "none";
        divCustomAlert.innerHTML = `
    <span id="alertMessage"></span>
       `
        divUnableVideo.innerHTML = `
    <div class="unableMuted">
        <button>START!</button>
    </div>
`
        return { divCustomAlert, divUnableVideo };
    }
    function updateVideosUI() {
        const videoDivs = document.querySelectorAll('.videoDiv');
        let videos = JSON.parse(sessionStorage.getItem('videosData'));
        let indexToScroll = JSON.parse(sessionStorage.getItem('indexCurrent'));
        if (indexToScroll >= 0 && indexToScroll < videos.length) {
            videoDivs[indexToScroll].scrollIntoView({ behavior: 'instant' });
        }
        videos.forEach((video, index) => {

            const currentVideoDiv = videoDivs[index];
            const likeIcon = currentVideoDiv.querySelector("#like-icon");
            let likesCount = currentVideoDiv.querySelector("[data-e2e='like-count']");
            let commentCount = currentVideoDiv.querySelector("[data-e2e='comment-count']");
            let shareCount = currentVideoDiv.querySelector("[data-e2e='share-count']");
            const followButton = currentVideoDiv.querySelector('.css-1hhj6ie-DivTextInfoContainer button');
            let changeButton = currentVideoDiv.querySelector('.css-1djnsui-ButtonLabel');

            likesCount.innerHTML = video.likes;
            commentCount.innerHTML = video.comments.length;
            shareCount.innerHTML = video.share_count;

            handleLike(video.id, likeIcon);
            handleFollow(video.user.id, followButton, changeButton);
        });
    }

    function continuePlay(video, divVideo) {
        const inputElement = divVideo.querySelector('.public-DraftEditor-content');
        const placeholderDiv = document.getElementById('placeholder-erend');
        const xButton = document.querySelector('.tiktok-yg0pvs-ButtonBasicButtonContainer-StyledCloseIconContainer');
        const volumeButton = document.querySelector('.tiktok-6mttet-ButtonVoiceControlNew');
        const threeDot = document.querySelector(".tiktok-q969e7-DivIconWrapper");
        const playIcon = document.getElementById('playIcon');
        const xgwrapper = document.getElementById('xgwrapper-2-7273303434869198082')
        const videoPlay = xgwrapper.querySelector('video');
        const mainContainer = document.querySelector('.tiktok-1qg2388-DivBrowserModeContainer')
        const divMainContainer = document.querySelector('.css-1t4vwes-DivMainContainer')
        const thumbnailDiv = document.querySelector('.tiktok-xhj3u2-StyledVideoBlurBackground');
        const videoThumbnail = thumbnailDiv.querySelector('img');
        const avatarImage = document.querySelector('.tiktok-uha12h-DivContainer').querySelector('img');
        const usernameElement = document.querySelector('[data-e2e="browse-username"] .tiktok-pocgy1-SpanEllipsis');
        const nameElement = document.querySelector('[data-e2e="browser-nickname"] .tiktok-pocgy1-SpanEllipsis');
        const daysDifferenceElement = document.querySelector('[data-e2e="browser-nickname"] span:last-child');
        const captionElement = document.querySelector('.tiktok-1wdx3tj-DivContainer').querySelector('.tiktok-j2a19r-SpanText:nth-child(1)');
        const actionElements = document.querySelector('.tiktok-1d39a26-DivFlexCenterRow');
        const likeElement = actionElements.querySelector('[data-e2e="browse-like-icon"]');
        const likeCountElement = document.querySelector('[data-e2e="browse-like-count"]');
        const commentCountElement = actionElements.querySelector('[data-e2e="browse-comment-count"]');
        const commentsCountElement = document.querySelector('.tiktok-15wq8g0-DivTabItem');
        const postComment = document.querySelector('.tiktok-n4wkvf-DivPostButton')
        const divCommentList = document.querySelector('.tiktok-1qp5gj2-DivCommentListContainer')
        const svgIcon = likeElement.querySelector('svg');
        const copyLinkText = document.querySelector('.tiktok-1v8b11s-PCopyLinkText')
        const buttonCopyLink = document.querySelector('.tiktok-7e23lp-ButtonCopyLink')
        const updateTimeDifference = formatTimeDifference(video.createdAt);
        const rightArrow = document.querySelector('.tiktok-1s9jpf8-ButtonBasicButtonContainer-StyledVideoSwitch');
        const leftArrow = document.querySelector('.tiktok-1w6o9i7-ButtonBasicButtonContainer-StyledVideoSwitch')
        const unableMuted = document.querySelector('.container-unableMuted')
        const button_unableMuted = document.querySelector('.unableMuted')
        const divFollowButton = document.querySelector('.tiktok-r4iroe-DivBtnWrapper')
        const followButton = divFollowButton.querySelector('button')
        const changeButton = document.querySelector('.tiktok-1djnsui-ButtonLabel')
        let indexCurrent = sessionStorage.getItem('indexCurrent');
        const divBottomCommentContainer = document.querySelector('.tiktok-19hqadz-DivBottomCommentContainer')
        let isMuted = false
        const divRigtVideo = divVideo.querySelector('.tiktok-1tunefa-DivVideoContainer')
        let isScrolling;
        let isMouseOver
        const handleVisibilityChange = () => {
            handleVisibilityEvent(videoPlay, playIcon);
        }

        const handlePopState = function (event) {
            const newPathname = window.location.pathname;
            xButton.click();
            // window.location.href = newPathname
        };

        copyLinkText.innerHTML = `${host}/video/${video.id}`
        indexCurrent = +indexCurrent

        updateVideoURL(`/video/${video.id}`, 'push');

        handleFollowDetail(video.user.id, followButton, changeButton);

        updateLeftArrowDisplay(indexCurrent, leftArrow);

        updateVideoDetails(video, commentsCountElement, likeCountElement, commentCountElement, usernameElement, nameElement, daysDifferenceElement, updateTimeDifference, captionElement, avatarImage, videoThumbnail, videoPlay, svgIcon);

        handleLikeDetail(video.id, svgIcon);

        removeCommentContainers();

        appendCommentsToContainer(video, video.comments, divCommentList, divBottomCommentContainer)

        followButton.addEventListener("click", () => {
            if (changeButton.innerHTML === "Follow") {
                followButton.classList = "tiktok-2cfmui-Button"
                changeButton.innerHTML = "Following"
                fetch(`/customer/follow/${video.user.id}`, {
                    method: 'POST',
                })
                    .then(async (data) => {
                        updateCustomer()
                        let newVideo = await updateVideo(video)
                        video = await newVideo
                        await updateVideoDataAtIndex(indexCurrent, video);
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
            } else {
                changeButton.innerHTML = "Follow"
                followButton.classList = "tiktok-1pcikqk-Button"
                fetch(`/customer/unfollow/${video.user.id}`, {
                    method: 'POST',
                })
                    .then(async (data) => {
                        updateCustomer()
                        let newVideo = await updateVideo(video)
                        video = await newVideo
                        await updateVideoDataAtIndex(indexCurrent, video);
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
            }
        })

        likeElement.addEventListener("click", () => {
            const fillValue = svgIcon.getAttribute('fill');
            if (fillValue === "rgba(22, 24, 35)") {
                likeCountElement.innerText = +likeCountElement.innerText + 1
                svgIcon.setAttribute('fill', 'rgba(254, 44, 85)');
                fetch(`/video/like/${video.id}`, {
                    method: 'POST',
                })
                    .then(async (data) => {
                        let newVideo = await updateVideo(video)
                        video = await newVideo
                        await updateVideoDataAtIndex(indexCurrent, video);
                        updateCustomer()
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
            } else {
                likeCountElement.innerText = +likeCountElement.innerText - 1
                svgIcon.setAttribute('fill', 'rgba(22, 24, 35)');
                fetch(`/video/dislike/${video.id}`, {
                    method: 'POST',
                })
                    .then(async (data) => {
                        let newVideo = await updateVideo(video)
                        video = await newVideo
                        await updateVideoDataAtIndex(indexCurrent, video);
                        updateCustomer()
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
            }
        });

        postComment.addEventListener('click', () => {
            if (inputElement.textContent.trim() !== '') {
                const data = {
                    mess: inputElement.textContent.trim()
                }
                fetch(`/video/comment/${video.id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json' // Định dạng dữ liệu gửi đi là JSON
                    },
                    body: JSON.stringify(data)
                })
                    .then(async (data) => {
                        placeholderDiv.style.display = 'block';
                        postComment.style.color = 'rgba(22, 24, 35, 0.34)'
                        const commentDiv = document.createElement('div');
                        commentDiv.classList = "listComments"
                        commentDiv.innerHTML = `
                                <div class="listComments">
                <div class="tiktok-1i7ohvi-DivCommentItemContainer">
                    <div id="7293732457551086344" class="tiktok-ulyotp-DivCommentContentContainer e1g2efjf0"><a data-e2e="comment-avatar-1" class="e1g2efjf5 tiktok-1jatens-StyledLink-StyledUserLinkAvatar er1vbsz0" href="/@dng.l.b4" style="flex: 0 0 40px;"><span shape="circle" data-e2e="" class="tiktok-tuohvl-SpanAvatarContainer e1e9er4e0" style="width: 40px; height: 40px;"><img loading="lazy" alt="" src="${customer.logo}" class="tiktok-1zpj2q-ImgAvatar"></span></a>
                        <div class="tiktok-1mf23fd-DivContentContainer e1g2efjf1"><a class="e1g2efjf4 tiktok-fx1avz-StyledLink-StyledUserLinkName er1vbsz0" href="/@dng.l.b4"><span data-e2e="comment-username-1" class="tiktok-1665s4c-SpanUserNameText e1g2efjf3">${customer.name}</span></a>
                            <p data-e2e="comment-level-1" class="tiktok-xm2h10-PCommentText e1g2efjf6"><span dir="">${inputElement.textContent.trim()}</span></p>
                            <p class="tiktok-1sun2p5-PCommentSubContent e1g2efjf9"><span data-e2e="comment-time-1" class="tiktok-4tru0g-SpanCreatedTime e1g2efjf8">0m ago</span><span aria-label="Reply" role="button" data-e2e="comment-reply-1" tabindex="0" class="tiktok-ro5z69-SpanReplyButton e1g2efjf10">Reply</span></p>
                        </div>
                        <div class="tiktok-1swe2yf-DivActionContainer esns4rh0">
                            <div aria-label="more" role="button" tabindex="0" class="tiktok-5g6iif-DivMoreContainer esns4rh1">
                                <div data-e2e="comment-more-icon"><svg class="tiktok-fzlfzu-StyledMoreIcon esns4rh2" width="1em" data-e2e="" height="1em" viewBox="0 0 48 48" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M4 24C4 21.7909 5.79086 20 8 20C10.2091 20 12 21.7909 12 24C12 26.2091 10.2091 28 8 28C5.79086 28 4 26.2091 4 24ZM20 24C20 21.7909 21.7909 20 24 20C26.2091 20 28 21.7909 28 24C28 26.2091 26.2091 28 24 28C21.7909 28 20 26.2091 20 24ZM36 24C36 21.7909 37.7909 20 40 20C42.2091 20 44 21.7909 44 24C44 26.2091 42.2091 28 40 28C37.7909 28 36 26.2091 36 24Z">
                                        </path>
                                    </svg></div>
                            </div>
                            <div aria-label="Like video
{number} likes" aria-pressed="false" role="button" tabindex="0" class="tiktok-114tc9h-DivLikeWrapper ezxoskx0">
                                <div data-e2e="comment-like-icon" class="tiktok-1tvtgfz-DivLikeIcon ezxoskx2"><svg width="20" data-e2e="" height="20" viewBox="0 0 48 48" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M24 9.01703C19.0025 3.74266 11.4674 3.736 6.67302 8.56049C1.77566 13.4886 1.77566 21.4735 6.67302 26.4016L22.5814 42.4098C22.9568 42.7876 23.4674 43 24 43C24.5326 43 25.0432 42.7876 25.4186 42.4098L41.327 26.4016C46.2243 21.4735 46.2243 13.4886 41.327 8.56049C36.5326 3.736 28.9975 3.74266 24 9.01703ZM21.4938 12.2118C17.9849 8.07195 12.7825 8.08727 9.51028 11.3801C6.16324 14.7481 6.16324 20.214 9.51028 23.582L24 38.1627L38.4897 23.582C41.8368 20.214 41.8368 14.7481 38.4897 11.3801C35.2175 8.08727 30.0151 8.07195 26.5062 12.2118L26.455 12.2722L25.4186 13.3151C25.0432 13.6929 24.5326 13.9053 24 13.9053C23.4674 13.9053 22.9568 13.6929 22.5814 13.3151L21.545 12.2722L21.4938 12.2118Z">
                                        </path>
                                    </svg></div><span data-e2e="comment-like-count" class="tiktok-gb2mrc-SpanCount ezxoskx3" style="margin-left: 0px; margin-right: 0px;">20</span>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
                                `
                        divCommentList.appendChild(commentDiv)
                        inputElement.textContent = ''

                        let newVideo = await updateVideo(video)
                        video = await newVideo
                        await updateVideoDetailsNotSouce(video, commentsCountElement, likeCountElement, commentCountElement, usernameElement, nameElement, daysDifferenceElement, updateTimeDifference, captionElement, avatarImage, videoThumbnail);
                        await updateVideoDataAtIndex(indexCurrent, video);
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
            }

        })

        videoPlay.addEventListener('timeupdate', function () {
            if (videoPlay.currentTime >= 4 && !videoPlay.hasAttribute('data-viewed')) {
                fetch(`/video/view/${video.id}`, {
                    method: 'POST',
                })
                    .then(data => {
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
                videoPlay.setAttribute('data-viewed', 'true');
            }
            if (videoPlay.currentTime === 0 && videoPlay.hasAttribute('data-viewed')) {
                videoPlay.removeAttribute('data-viewed');
            }
        });

        buttonCopyLink.addEventListener('click', () => {
            let textToCopy = copyLinkText.innerHTML
            let textArea = document.createElement("textarea");
            textArea.value = textToCopy;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                var successful = document.execCommand('copy');
                var msg = successful ? 'successful' : 'unsuccessful';
                showCustomAlert("Link copied successfully");
                fetch(`/video/share/${video.id}`, {
                    method: 'POST',
                })
                    .then(data => {
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
            } catch (err) {
                console.error('Unable to copy text');
            }
            document.body.removeChild(textArea);
        })

        videoPlay.play().catch(error => {
            console.log("error:", error)
            unableMuted.style.display = 'flex'
        })

        button_unableMuted.addEventListener('click', function () {
            sessionStorage.setItem('videosData', JSON.stringify(videos));
            sessionStorage.setItem('indexCurrent', 0);
            sessionStorage.setItem('firstURL', true);
            unableMuted.style.display = 'none'
            videoPlay.muted = false;
            videoPlay.play();
        })

        document.addEventListener('visibilitychange', handleVisibilityChange);

        volumeButton.addEventListener('click', () => {
            isMuted = !isMuted;
            if (isMuted) {
                updateVolumeIcon(isMuted, volumeButton)
            } else {
                updateVolumeIcon(isMuted, volumeButton)
            }
            if (videoPlay) {
                if (videoPlay.muted) {
                    videoPlay.play();
                    videoPlay.muted = false;
                } else {
                    videoPlay.play();
                    videoPlay.muted = true;
                }
            }
        });

        xgwrapper.addEventListener('click', function () {
            if (videoPlay.paused) {
                playIcon.style.display = 'none';
                videoPlay.play();
                videoPlay.removeAttribute('loop');
            } else {
                playIcon.style.display = 'block';
                videoPlay.pause();
                videoPlay.setAttribute('loop', '');
            }
        });

        xButton.addEventListener('click', function () {
            divVideo.remove();
            bigDiv.style.display = 'flex'
            navMenu.style.display = 'flex'
            listVideoDiv.style.display = 'flex'
            listDiv.style.marginTop = '60px'
            navMenuMiddle.style.display = 'flex'
            isMouseOver = false;
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            updateVideoURL(`/video/videos`, 'push');
            updateCustomer()
            updateVideosUI()
        })

        inputElement.addEventListener('input', function () {
            if (inputElement.textContent.trim() !== '') {
                placeholderDiv.style.display = 'none';
                postComment.style.color = 'rgba(234, 40, 78, 1)'
            } else {
                placeholderDiv.style.display = 'block';
                postComment.style.color = 'rgba(22, 24, 35, 0.34)'
            }
        });

        leftArrow.addEventListener('click', () => {
            indexCurrent--
            video = videos[indexCurrent]
            sessionStorage.setItem('indexCurrent', indexCurrent);
            playIcon.style.display = 'none';
            copyLinkText.innerHTML = `${host}/video/${video.id}`
            removeCommentContainers();
            updateVideoDetails(video, commentsCountElement, likeCountElement, commentCountElement, usernameElement, nameElement, daysDifferenceElement, updateTimeDifference, captionElement, avatarImage, videoThumbnail, videoPlay, svgIcon);
            handleFollowDetail(video.user.id, followButton, changeButton);
            handleLikeDetail(video.id, svgIcon);
            updateLeftArrowDisplay(indexCurrent, leftArrow);
            appendCommentsToContainer(video, video.comments, divCommentList, divBottomCommentContainer)
            updateVideoURL(`/video/${video.id}`, 'replace');
            updateCustomer()
        });

        rightArrow.addEventListener('click', () => {
            if (indexCurrent === videos.length - 1) {
                showCustomAlert("RUN OUT OF VIDEOs")
            } else {
                indexCurrent++
                video = videos[indexCurrent]
                sessionStorage.setItem('indexCurrent', indexCurrent);
                playIcon.style.display = 'none';
                copyLinkText.innerHTML = `${host}/video/${video.id}`
                removeCommentContainers();
                updateLeftArrowDisplay(indexCurrent, leftArrow);
                updateVideoDetails(video, commentsCountElement, likeCountElement, commentCountElement, usernameElement, nameElement, daysDifferenceElement, updateTimeDifference, captionElement, avatarImage, videoThumbnail, videoPlay, svgIcon);
                handleFollowDetail(video.user.id, followButton, changeButton);
                handleLikeDetail(video.id, svgIcon);
                appendCommentsToContainer(video, video.comments, divCommentList, divBottomCommentContainer)
                updateVideoURL(`/video/${video.id}`, 'replace');
                updateCustomer()
            }

        })

        document.addEventListener('keydown', function (event) {
            switch (event.key) {
                case "ArrowUp":
                    if (!isMouseOver) {
                        return;
                    }
                    if (indexCurrent > '0') {
                        leftArrow.click()
                    }
                    break;
                case "ArrowDown":
                    if (!isMouseOver) {
                        return;
                    }
                    rightArrow.click()
                    break;
                case "ArrowLeft":
                    if (!isMouseOver) {
                        return;
                    }
                    video.currentTime -= 3;
                    break;
                case "ArrowRight":
                    if (!isMouseOver) {
                        return;
                    }
                    videoPlay.currentTime += 3;
                    break;
                case " ":
                    if (!isMouseOver) {
                        return;
                    }
                    xgwrapper.click()
                    break;
            }
        });

        divRigtVideo.addEventListener('mouseenter', function () {
            isMouseOver = true;
        });

        divRigtVideo.addEventListener('mouseleave', function () {
            isMouseOver = false;
        });

        window.addEventListener("wheel", function (event) {
            if (!isMouseOver) {
                return;
            }
            window.clearTimeout(isScrolling);
            isScrolling = setTimeout(function () {
                if (event.deltaY > 0) {
                    rightArrow.click()
                } else {
                    if (indexCurrent > '0') {
                        leftArrow.click()
                    }
                }
            }, 80);

        }, false);
    }

    if (video !== null) {
        videos = [video, ...videos]
        sessionStorage.setItem('videosData', JSON.stringify(videos));
        sessionStorage.setItem('indexCurrent', 0);
        listVideoDiv.style.display = 'none'
        bigDiv.style.display = 'none'
        listDiv.style.marginTop = '0'
        navMenu.style.display = 'none'
        navMenuMiddle.style.display = 'none'
        const divVideo = createVideoContainer();
        const { divCustomAlert, divUnableVideo } = createToolThree()
        document.body.append(divVideo, divCustomAlert, divUnableVideo)
        continuePlay(video, divVideo)
    } else {
        // if (window.location.pathname !== "/video/videos") {
        //     updateVideoURL(`/video/videos`, 'replace');
        //     showCustomAlert("Not found video");
        // }

    }


    videos.forEach((video, index) => {
        const videoDiv = document.createElement('div')
        videoDiv.classList = "videoDiv"
        videoDiv.innerHTML = `
             <div data-e2e="recommend-list-item-container" class="css-14bp9b0-DivItemContainer etvrc4k0"><a class="avatar-anchor etvrc4k4 css-m1rpgs-StyledLink er1vbsz0" data-e2e="video-author-avatar" aria-label="Adam’s profile" href="/customer/profile/${video.user.id}">
                <div class="css-uha12h-DivContainer e1vl87hj1" style="width: 56px; height: 56px;"><span shape="circle" data-e2e="" class="e1vl87hj2 css-1bzan2v-SpanAvatarContainer-StyledAvatar e1e9er4e0" style="width: 56px; height: 56px;"><img loading="lazy" alt="" src='${video.user.logo}' class="css-1zpj2q-ImgAvatar e1e9er4e1"></span></div>
            </a>
                <div class="css-1l0odge-DivContentContainer etvrc4k1">
                    <div class="css-1hhj6ie-DivTextInfoContainer">
                        <div class="css-1mnwhn0-DivAuthorContainer etvrc4k6"><a class="avatar-anchor etvrc4k4 css-m1rpgs-StyledLink er1vbsz0" href="/customer/profile/${video.user.id}">
                            <div class="css-uha12h-DivContainer e1vl87hj1" style="width: 40px; height: 40px;"><span shape="circle" data-e2e="" class="e1vl87hj2 css-gcksof-SpanAvatarContainer-StyledAvatar e1e9er4e0" style="width: 40px; height: 40px;"><img loading="lazy" alt="" class="css-1zpj2q-ImgAvatar e1e9er4e1"></span></div>
                        </a><a class="emt6k1z1 css-1ew4g6u-StyledLink-StyledAuthorAnchor er1vbsz0" href="/customer/profile/${video.user.id}">
                                <h3 data-e2e="video-author-uniqueid" class="css-1k5oywg-H3AuthorTitle emt6k1z0">${video.user.username}</h3>
                                <h4 data-e2e="video-author-nickname" class="css-mc6xrz-H4AuthorName emt6k1z2">${video.user.name}</h4>
                            </a></div><button class="css-1847gtm-Button-StyledFollowButtonTux" data-e2e="feed-follow">
                            <div class="css-jp3752-ButtonContent e1v8cfre2">
                                <div class="css-1djnsui-ButtonLabel e1v8cfre3">Follow</div>
                            </div>
                        </button>
                        <div class="css-bs495z-DivWrapper e1mzilcj0">
                            <div class="css-1rhses0-DivText e1mzilcj1" style="max-height: unset;">
                                <div class="css-mokgbx-DivBtnWrapper e1mzilcj4"><button type="button" class="css-1r94cis-ButtonExpand e1mzilcj2">more</button></div>
                                <div data-e2e="video-desc" class="css-1iy6zew-DivContainer ejg0rhn0">${video.caption}</div>
                            </div>
                        </div>
                        <div class="css-9s4tdv-DivMusicTagsWrapper etvrc4k9">
                            <h4 data-e2e="video-music" class="css-1dx8yl-H4Link epjbyn0"><a target="_self" rel="opener" class="epjbyn1 css-v80f7r-StyledLink-StyledLink er1vbsz0" aria-label="Watch more videos with music original sound - 🍪" href="/music/original-sound-7059518787955034882"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="rgba(22, 24, 35, 1)" styletype="0" class="css-wyuo16-MusicNoteIcon epjbyn4">
                                <use xlink: href="#Music_Note-8c658968"></use>
                            </svg>
                                <div class="css-pvx3oa-DivMusicText epjbyn3">original sound - 🍪</div>
                            </a></h4>
                            <div class="css-1483eyc-DivAnchorTagWrapper e1sksq2r0"></div>
                        </div>
                    </div>
                    <div class="css-1kep9d3-DivVideoWrapper e1bh0wg711">
                        <div tabindex="0" role="button" aria-label="Watch in full screen" id="one-column-item-0" data-e2e="feed-video" class="css-9oopl7-DivVideoCardContainer e1bh0wg71" style="background-image: url(&quot;${video.thumbnail};);"><canvas width="56.25" height="100" class="css-196h150-CanvasVideoCardPlaceholder e1bh0wg70"></canvas>
                            <div class="css-rnjquf-DivVideoPlayerContainer e1bh0wg710">
                                <div mode="0" class="css-yf3ohr-DivContainer e1yey0rl0" style="overflow: hidden; border-radius: 8px;">
                                    <div class="css-41hm0z"><span style="box-sizing: border-box; display: block; overflow: hidden; width: initial; height: initial; background: none; opacity: 1; border: 0px; margin: 0px; padding: 0px; position: absolute; inset: 0px;">
                                    </span></div>
                                    <div class="css-1fofj7p-DivBasicPlayerWrapper e1yey0rl2">
                                        <div id="xgwrapper-0-7272363336711392530" class="tiktok-web-player no-controls" style="width: 100%; height: 100%;">
                                            <video playsinline="" preload="auto" crossorigin="use-credentials" style="width: 100%; height: 100%;"></video>
                                        </div>
                                    </div>
                                </div>
                                <div tabindex="0" role="button" aria-label="Play" aria-pressed="true" data-e2e="video-play" class="css-mlcjt3-DivPlayIconContainer-StyledDivPlayIconContainer e1bh0wg73"><svg width="20" data-e2e="" height="20" viewBox="0 0 48 48" fill="#fff" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8 6C8 5.44771 8.44772 5 9 5H17C17.5523 5 18 5.44772 18 6V42C18 42.5523 17.5523 43 17 43H9C8.44772 43 8 42.5523 8 42V6Z">
                                    </path>
                                    <path d="M30 6C30 5.44771 30.4477 5 31 5H39C39.5523 5 40 5.44772 40 6V42C40 42.5523 39.5523 43 39 43H31C30.4477 43 30 42.5523 30 42V6Z">
                                    </path>
                                </svg></div>
                                <div class="css-q09c19-DivVoiceControlContainer e1bh0wg76">
                                    <div data-e2e="video-sound" tabindex="0" role="button" aria-label="Volume" aria-pressed="true" class="css-105iyqb-DivMuteIconContainer e1bh0wg75"><svg width="24" data-e2e="" height="24" viewBox="0 0 48 48" fill="#fff" xmlns="http://www.w3.org/2000/svg">
                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M20.3359 8.37236C22.3296 7.04325 25 8.47242 25 10.8685V37.1315C25 39.5276 22.3296 40.9567 20.3359 39.6276L10.3944 33H6C4.34314 33 3 31.6568 3 30V18C3 16.3431 4.34315 15 6 15H10.3944L20.3359 8.37236ZM21 12.737L12.1094 18.6641C11.7809 18.8831 11.3948 19 11 19H7V29H11C11.3948 29 11.7809 29.1169 12.1094 29.3359L21 35.263V12.737ZM32.9998 24C32.9998 21.5583 32.0293 19.3445 30.4479 17.7211C30.0625 17.3255 29.9964 16.6989 30.3472 16.2724L31.6177 14.7277C31.9685 14.3011 32.6017 14.2371 33.0001 14.6195C35.4628 16.9832 36.9998 20.3128 36.9998 24C36.9998 27.6872 35.4628 31.0168 33.0001 33.3805C32.6017 33.7629 31.9685 33.6989 31.6177 33.2724L30.3472 31.7277C29.9964 31.3011 30.0625 30.6745 30.4479 30.2789C32.0293 28.6556 32.9998 26.4418 32.9998 24ZM37.0144 11.05C36.6563 11.4705 36.7094 12.0995 37.1069 12.4829C40.1263 15.3951 42.0002 19.4778 42.0002 23.9999C42.0002 28.522 40.1263 32.6047 37.1069 35.5169C36.7094 35.9003 36.6563 36.5293 37.0144 36.9498L38.3109 38.4727C38.6689 38.8932 39.302 38.9456 39.7041 38.5671C43.5774 34.9219 46.0002 29.7429 46.0002 23.9999C46.0002 18.2569 43.5774 13.078 39.7041 9.43271C39.302 9.05421 38.6689 9.10664 38.3109 9.52716L37.0144 11.05Z">
                                        </path>
                                    </svg></div>
                                </div>
                                <div class="css-fxqf0v-DivVideoControlBottom e1n49v430"></div>
                                <div tabindex="0" class="css-1n67qnj-DivIconWrapper e1bh0wg78"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor">
                                    <use xlink: href="#Ellipsis_Horizontal_Fill-9ee69fcf"></use>
                                </svg></div>
                            </div>
                        </div>
                        <div class="css-1cifsuk-DivActionItemContainer e1whjx9o0"><button type="button" aria-label="Like video
5.5M likes" aria-pressed="false" class="css-1ok4pbl-ButtonActionItem e1hk3hf90"><span data-e2e="like-icon" id="like-icon" class="css-6jur1x-SpanIconWrapper" style="color: rgb(22, 24, 35);"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor">
                                <use xlink: href="#heart-fill-03bd63df"></use>
                            </svg></span><strong data-e2e="like-count" class="css-w1dlre-StrongText">${video.likes}</strong></button><button type="button" aria-label="Read or add comments
43.7K comments" class="css-1ok4pbl-ButtonActionItem e1hk3hf90"><span data-e2e="comment-icon" id="comment-icon" class="css-6jur1x-SpanIconWrapper" style="color: rgb(22, 24, 35);"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor">
                                    <use xlink: href="#Bubble_Ellipsis_Right_Fill-a497dc09"></use>
                                </svg></span><strong data-e2e="comment-count" class="css-w1dlre-StrongText">${video.comments.length}</strong></button>
                                <button type="button" aria-label="Share video
180.6K shares" aria-expanded="false" class="css-1ok4pbl-ButtonActionItem e1hk3hf90"><span data-e2e="share-icon" id="share-icon" class="css-6jur1x-SpanIconWrapper" style="color: rgb(22, 24, 35);"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor">
                                    <use xlink: href="#pc-share-44d9fe83"></use>
                                </svg></span><strong data-e2e="share-count" class="css-w1dlre-StrongText">${video.share_count}</strong></button></div>
                    </div>
                </div>
            </div>
            `
        videosContainer.appendChild(videoDiv)

        const clickVideoDiv = videoDiv.querySelector('.css-rnjquf-DivVideoPlayerContainer');
        const likeIcon = videoDiv.querySelector("#like-icon");
        const likesCount = videoDiv.querySelector("[data-e2e='like-count']");
        const commentIcon = videoDiv.querySelector("#comment-icon");
        const shareIcon = videoDiv.querySelector('#share-icon');
        const followButton = videoDiv.querySelector('.css-1847gtm-Button-StyledFollowButtonTux')
        let changeButton = videoDiv.querySelector('.css-1djnsui-ButtonLabel')

        handleLike(video.id, likeIcon);
        handleFollow(video.user.id, followButton, changeButton);

        followButton.addEventListener("click", () => {
            if (changeButton.innerHTML === "Follow") {
                followButton.classList = "css-zmqo9-Button-StyledFollowButtonTux"
                changeButton.innerHTML = "Following"
                fetch(`/customer/follow/${video.user.id}`, {
                    method: 'POST',
                })
                    .then(data => {
                        updateCustomerAndFollow(video, "follow");
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
            } else {
                changeButton.innerHTML = "Follow"
                followButton.classList = "css-1847gtm-Button-StyledFollowButtonTux"
                fetch(`/customer/unfollow/${video.user.id}`, {
                    method: 'POST',
                })
                    .then(data => {
                        updateCustomerAndFollow(video, "unfollow");
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
            }
        })

        likeIcon.addEventListener("click", () => {
            let likeCountElement = videoDiv.querySelector('[data-e2e="like-count"]');
            if (likeIcon.style.color === "rgb(22, 24, 35)") {
                likeCountElement.innerHTML = +likeCountElement.innerHTML + 1
                fetch(`/video/like/${video.id}`, {
                    method: 'POST',
                }).then(async (response) => {
                    await updateCustomerAndLike(video, likeIcon);
                    let newVideo = await updateVideo(video)
                    video = await newVideo
                    await updateVideoDataAtIndex(index, video);
                })
                    .catch(error => {
                        console.error('Error:', error);
                    });
            } else {
                likeCountElement.innerHTML = +likeCountElement.innerHTML - 1
                fetch(`/video/dislike/${video.id}`, {
                    method: 'POST',
                }).then(async (response) => {
                    updateCustomerAndLike(video, likeIcon);
                    let newVideo = await updateVideo(video)
                    video = await newVideo
                    await updateVideoDataAtIndex(index, video);
                })
                    .catch(error => {
                        console.error('Error:', error);
                    });
            }
        });

        commentIcon.addEventListener('click', function () {
            clickVideoDiv.click();
        });

        shareIcon.addEventListener('click', function () {
            const textToCopy = `${host}/video/${video.id}`;
            navigator.clipboard.writeText(textToCopy);
            try {
                showCustomAlert("Link copied successfully");
                fetch(`/video/share/${video.id}`, {
                    method: 'POST',
                })
                    .then(data => {
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });

            } catch (err) {
                showCustomAlert("Unable to copy text");
            }
        })

        clickVideoDiv.addEventListener('click', () => {
            let videos = JSON.parse(sessionStorage.getItem('videosData'));
            sessionStorage.setItem('indexCurrent', index);
            listVideoDiv.style.display = 'none'
            listDiv.style.marginTop = '0'
            bigDiv.style.display = 'none'
            navMenu.style.display = 'none'
            navMenuMiddle.style.display = 'none'
            const divVideo = createVideoContainer();
            document.body.appendChild(divVideo)
            continuePlay(videos[index], divVideo)
        });
    }
    )
}