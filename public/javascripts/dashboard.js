$(function() {
    //*****HIDE ALL TABS ON PAGE RENDERING */
    $(".container2").hide();
    $(".edit").hide();
    $(".newArticle").hide();
    $(".password").hide();
    $(".delete").hide();
    $(".my_profile").hide();
    $(".users").hide();
    /*
     ****************************************************
     ********************BUTTONS*************************
     ****************************************************
     */
    //CLOSE BUTTON
    $('body').on('click', '#closeBtn', function() {
        $(".password").slideUp(1200);
        $(".delete").slideUp(1200);
        $(".edit").slideUp(1200);
        $(".my_profile").slideUp(1200);
        $(".newArticle").slideUp(1200);
        $(".container2").slideUp(1200);
        $(".users").slideUp(1200);
        $(".container").slideDown(1200);
    })

    // OPEN MY PROFILE PANEL
    $('body').on('click', '#my_profile', function() {
        $(".password").slideUp(1200);
        $(".delete").slideUp(1200);
        $(".edit").slideUp(1200);
        $(".container").slideUp(1200);
        $(".newArticle").slideUp(1200);
        $(".container2").slideUp(1200);
        $(".users").slideUp(1200);
        $(".my_profile").slideDown(1200);
    })

    //OPEN EDIT PANEL
    $('body').on('click', '#edit', function() {
        $(".container").slideUp(1200);
        $(".password").slideUp(1200);
        $(".delete").slideUp(1200);
        $(".my_profile").slideUp(1200);
        $(".newArticle").slideUp(1200);
        $(".container2").slideUp(1200);
        $(".users").slideUp(1200);
        $(".edit").slideDown(1200);
    });

    //OPEN OTHER ALL USERS PANEL FOR ADMIN
    $('body').on('click', '#allUsers', function() {
        $(".container").slideUp(1200);
        $(".container2").slideUp(1200);
        $(".password").slideUp(1200);
        $(".delete").slideUp(1200);
        $(".my_profile").slideUp(1200);
        $(".newArticle").slideUp(1200);
        $(".edit").slideUp(1200);


        $.get('/api/dashboard/getAll', (data, err) => {
            if (err !== 'success') {
                return $('.modal-body').html(''), $('.modal-body').html(err.responseText), $("#triger").click();
            }
            if (data) {
                $('.usersNav').html('');
                for (let i = 0; i < Math.ceil(data.usersLength / 4); i++) {
                    $('.usersNav').append(`
                   <li class="page-item" id='${i+1}'><a class="page-link" href="#nav">${i+1}</a></li>
                   `)
                    $('body').on('click', `#${i+1}`, function() {
                        const page = ($(this).attr('id'));
                        $('li').removeClass("active")
                        $(this).addClass("page-item active")
                        allUsers(page)
                    })
                    allUsers(1)
                }
            }
        })

        $(".users").slideDown(1200);


    });
    //OPEN CHANGE PASSWORD PANEL
    $('body').on('click', '#change', function() {
        $(".container").slideUp(1200);
        $(".edit").slideUp(1200);
        $(".delete").slideUp(1200);
        $(".my_profile").slideUp(1200);
        $(".newArticle").slideUp(1200);
        $(".container2").slideUp(1200);
        $(".users").slideUp(1200);
        $('.password').slideToggle(1200);
    });

    //OPNE DELETE ACCOUNT PANEL
    $('body').on('click', '#delete', function() {
        $(".container").slideUp(1200);
        $(".password").slideUp(1200);
        $(".edit").slideUp(1200);
        $(".my_profile").slideUp(1200);
        $(".newArticle").slideUp(1200);
        $(".container2").slideUp(1200);
        $(".users").slideUp(1200);
        $('.delete').slideDown(1200);
    });

    //OPEN ADD NEW ARTICLE PANEL
    $('body').on('click', '#addArticle', function() {
        $(".container").slideUp(1200);
        $(".password").slideUp(1200);
        $(".edit").slideUp(1200);
        $(".my_profile").slideUp(1200);
        $('.delete').slideUp(1200);
        $(".container2").slideUp(1200);
        $(".users").slideUp(1200);
        $('.newArticle').slideDown(1200);

    });

    /*
     ****************************************************
     ********************FUNCTIONS***********************
     ****************************************************
     */

    //SEND EDIT PANEL DATA TO SERVER
    $('body').on('click', '#save', function() {
        const username = $('#username').val();
        const password = $('#password').val();
        const firstName = $('#firstName').val();
        const lastName = $('#lastName').val();
        const gender = $('input[name="gender"]:checked').val();
        const number = $('#number').val();

        const user_edit = {
            username: username,
            password: password,
            firstName: firstName,
            mobile: number,
            lastName: lastName,
            sex: gender
        }

        $.ajax({
            type: "POST",
            url: "/api/dashboard/edit",
            data: user_edit,
            success: function(data) {
                if (data.msg === "success") {
                    $('.modal-body').html(''), $('.modal-body').html('your information edited sucssesfully you need to login again'), $("#triger").click();
                    setTimeout(function() {
                        window.location.href = '/api/login'
                    }, 3000);
                }
            },
            error: function(err) {
                $('.modal-body').html(''), $('.modal-body').html(err.responseText), $("#triger").click();
            }
        })
    });
    // SEND CHANGE PASSWORD DATA TO SERVER
    $('body').on('click', '#pass_save', function() {
        const id = $('#id').val();
        const pass = $('#old_pass').val();
        const new_password = $('#new_pass').val();

        const new_pass = {
            _id: id,
            password: pass,
            new_password: new_password
        }

        $.ajax({
            type: "POST",
            url: "/api/dashboard/password",
            data: new_pass,
            success: function(data) {
                if (data.msg === 'sucsses') {
                    $('.modal-body').html(''), $('.modal-body').html('your password sucssesfully changed you need to login again'), $("#triger").click();
                    setTimeout(function() {
                        window.location.href = '/api/login'
                    }, 3000);
                }
            },
            error: function(err) {
                $('.modal-body').html(''), $('.modal-body').html(err.responseText), $("#triger").click();
            }
        })
    });


    // SEND DELETE ACCOUNT DATA TO SERVER
    $('body').on('click', '#delete_account', function() {
        const pass = $('#delete_pass').val()

        const check_pass = {
            username: $('#username').val(),
            password: pass
        }

        $.ajax({
            type: "POST",
            url: "/api/dashboard/delete",
            data: check_pass,
            success: function(data) {
                if (data === 'deleted') {
                    $('.modal-body').html(''), $('.modal-body').html('your account has been deleted!'), $("#triger").click();
                    setTimeout(function() {
                        window.location.href = '/api/register'
                    }, 3000);
                }
            },
            error: function(err) {
                $('.modal-body').html(''), $('.modal-body').html(err.responseText), $("#triger").click();
            }
        })
    });


    // SEND DELETE AVATAR REQUEST TO SERVER
    $('body').on('click', '#deleteImage', function() {
        $.ajax({
            url: '/api/dashboard/deleteAvatar',
            type: 'DELETE',
            success: function(data) {
                $('.modal-body').html(''), $('.modal-body').html(data)
                setTimeout(function() {
                    window.location.href = '/api/register'
                }, 2000);
            },
            error: function(err) {
                $('.modal-body').html(''), $('.modal-body').html(err.responseText)
                setTimeout(function() {
                    $("#triger").click();
                }, 2000);
            }
        });
    });


    // SEND ADD NEW AVATAR DATA TO SERVER
    $('body').on('click', '#userAvatar', function() {
        $('.modal-body').html(''), $('.modal-body').html(` 
        <form name='userAvatar' action="/api/dashboard/avatar" method="post" enctype="multipart/form-data">
        <input type="file" class='form-control form-control-sm' name="avatar" id='avatarInput'>
        <button type="submit" value="submit">Submit</button>
        </form>
        <button id="deleteImage">Delete Avatar</button>`), $("#triger").click();
        $("form[name='userAvatar']").on("submit", function(ev) {
            ev.preventDefault(); // Prevent browser default submit.
            var formData = new FormData(this);


            $.ajax({
                url: "/api/dashboard/avatar",
                type: "POST",
                data: formData,
                success: function(msg) {
                    $('.modal-body').html(''), $('.modal-body').html(msg)
                    setTimeout(function() {
                        window.location.href = '/api/dashboard'
                    }, 2000);
                },
                error: function(err) {
                    $('.modal-body').html(''), $('.modal-body').html(err.responseText)
                    setTimeout(function() {
                        $("#triger").click();
                    }, 2000);
                },
                cache: false,
                contentType: false,
                processData: false
            });

        });
    })


    //GET ALL USERS FOR ADMIN
    function allUsers(page) {
        $.get(`/api/dashboard/getAll?page=${page}`, (data, response) => {
            if (response !== 'success') {
                $('.modal-body').html(''), $('.modal-body').html(response)
                setTimeout(function() {
                    location.reload()
                }, 2000);
            }

            $('.usersHeader').html(`All Users <br> Page: ${page}`)
            $('.usersBox').html('')

            const allUsers = data.users
            for (let i = 0; i < allUsers.length; i++) {
                let date = allUsers[i].createdAt
                date = date.substring(0, date.length - 14);
                $('.usersBox').append(`
                <div class="card" style="width: 18rem; margin:10px">
                    <div class="d-flex justify-content-center mb-2">
                        <img src="/images/avatars/${allUsers[i].avatar}" class="card-img-top" style="width:150px; height:150px; border-radius:50px;">
                    </div>
                        <div style='text-align:center;'>
                            <h5 class="card-title">User Name: ${allUsers[i].username}</h5>
                            <p class="card-text">First Name: ${allUsers[i].firstName}</p>
                            <p class="card-text">Last Name:  ${allUsers[i].lastName}</p>
                            <p class="card-text">Gender:  ${allUsers[i].sex}</p>
                            <p class="card-text">Mobile:  ${allUsers[i].mobile}</p>
                            <p class="card-text">Joined: ${allUsers[i].createdAt}</p>
                        <div class="${allUsers[i]._id}" id="reset">
                            <button class="resetPassword">RESET PASSWORD</button>
                            <button class="deleteUser">DELETE USER</button>
                        </div>
                    </div>
                 </div> `)
            }
            //DELETE USER FUNCTION
            $('body').on('click', '.deleteUser', function() {
                const user_id = ($(this).parent().attr('class'));
                $('.modal-body').html(''), $('.modal-body').html(`
                        <h3> ARE YOU SURE YOU WANT TO DELETE THIS USER?</h3>
                        <button id="deleteThis">YES</button>
                        <button id="no">NO</button>
                        `), $("#triger").click();
                $('body').on('click', '#no', function() {
                    $('.modal-body').html(''), $("#triger").click();
                })
                $('body').on('click', '#deleteThis', function() {
                    $.ajax({
                        url: `/api/dashboard/delete/${user_id}`,
                        type: 'GET',
                        success: function(data) {
                            $('.modal-body').html(''), $('.modal-body').html(data)
                            setTimeout(function() {
                                $("#triger").click();
                                $("#allUsers").click();
                            }, 2000);
                        },
                        error: function(err) {
                            $('.modal-body').html(''), $('.modal-body').html(err.responseText)
                            setTimeout(function() {
                                location.reload()
                            }, 2000);
                        }
                    });
                })
            })
            $('body').on('click', '.resetPassword', function() {
                const user_id = ($(this).parent().attr('class'));
                $('.modal-body').html(''), $('.modal-body').html(`
                        <h3> ARE YOU SURE YOU WANT TO RESET THIS USERS PASSWORD TO THEIR MOBILE NUMBER?</h3>
                        <button id="resetThis">YES</button>
                        <button id="no">NO</button>
                        `), $("#triger").click();
                $('body').on('click', '#no', function() {
                    $('.modal-body').html(''), $("#triger").click();
                })
                $('body').on('click', '#resetThis', function() {
                    $.ajax({
                        url: `/api/dashboard/resetPassword/${user_id}`,
                        type: 'GET',
                        success: function(data) {
                            $('.modal-body').html(''), $('.modal-body').html(`${data}<button id="no">OK</button>`)
                        },
                        error: function(err) {
                            $('.modal-body').html(''), $('.modal-body').html(err.responseText)
                            setTimeout(function() {
                                $("#triger").click();
                            }, 2000);
                        }
                    });
                })
            })
        })
    }
    //GET USER ARTICLES FROM SERVER AND RENDER THEM
    $.ajax({
        url: `/api/articles/myArticles/${$('#id').val()}`,
        type: 'get',
        success: function(data) {
            for (let i = 0; i < Math.ceil(data.length / 10); i++) {
                $('.ulNav').append(`
            <li class="page-item" id="${i+1}"><a class="page-link" href="#nav">${i+1}</a></li>
        `)
                $('body').on('click', `#${i+1}`, function() {
                    const page = ($(this).attr('id'));
                    $('li').removeClass("active")
                    $(this).addClass("page-item active")
                    articlesRender(page)
                })
            }
            articlesRender(1)
        },
        error: function(err) {
            $('.modal-body').html(''), $('.modal-body').html(err.responseText)
            setTimeout(function() {
                $("#triger").click();
            }, 2000);
        }
    })

    function articlesRender(page) {
        if (!page) {
            page = 1
        }
        $.ajax({
            url: `/api/articles/myArticles/${$('#id').val()}?page=${page}`,
            type: 'get',
            success: function(data) {
                $('.articles').html(``);
                $('#header').html(``);
                $('#header').html(`YOUR ARTICLES <br/> PAGE : ${data.page}`);
                for (let i = 0; i < data.article.length; i++) {
                    let date = data.article[i].createdAt
                    date = date.substring(0, date.length - 14);
                    $('.articles').append(`
                    <div class="card-body">
                    <div class="pages mt-3 col-12 col-md-6 col-lg-4" style="width:100%;">
                    <div class="card">
                        <div class="card-body" style="border-radius: 10px;">
                        <img  style="width:50px;height:50px;" src="/images/avatars/${data.article[i].owner.avatar}" alt="avatar" class="photo">
                            <h5 class="card-title">TITLE:${data.article[i].title} </h5>
                            <h6 class="card-title">BY:${data.article[i].owner.username} </h6>
                            <div class="article_text">TEXT:${data.article[i].text}</div> 
                            <a href="/api/articles/${data.article[i]._id}">more...</a>
                            <p>CREATED AT:${date}</p>
                            <img class="img-fluid" style="width:auto;" src="/images/avatars/${data.article[i].avatar}" alt="avatar" class="photo">
                            <div class="${data.article[i]._id}">
                            <button class="editArticle">EDIT</button>
                            <button class="deleteArticle">DELETE</button>
                            </div>
                        </div>
                    </div>
                </div>
                   `)

                }
                //DELETE ARTICLE FUNCTION
                $('body').on('click', '.deleteArticle', function() {
                        $('.modal-body').html(''), $('.modal-body').html(`
                    <h3> ARE YOU SURE YOU WANT TO DELETE THIS ARTICLE?</h3>
                    <button id="deleteThis">YES</button>
                    <button id="no">NO</button>
                    `), $("#triger").click();
                        const article_id = ($(this).parent().attr('class'));
                        $('body').on('click', '#no', function() {
                            $('.modal-body').html(''), $("#triger").click();
                        })
                        $('body').on('click', '#deleteThis', function() {
                            $.ajax({
                                url: `/api/articles/delete/${article_id}`,
                                type: 'GET',
                                success: function(data) {
                                    $('.modal-body').html(''), $('.modal-body').html(data)
                                    setTimeout(function() {
                                        window.location.href = '/api/register'
                                    }, 2000);
                                },
                                error: function(err) {
                                    $('.modal-body').html(''), $('.modal-body').html(err.responseText)
                                    setTimeout(function() {
                                        $("#triger").click();
                                    }, 2000);
                                }
                            });
                        })
                    })
                    //EDIT ARITCLE FUNCTION
                $('body').on('click', '.editArticle', function() {
                    const article_id = ($(this).parent().attr('class'));
                    $('body').on('click', '#no', function() {
                        $('.modal-body').html(''), $("#triger").click();
                    })
                    $.ajax({
                        url: `/api/articles/article/${article_id}`,
                        type: 'GET',
                        success: function(data) {
                            $('.modal-body').html(''), $('.modal-body').html(`
                                    <img id="article_avatar" src="/images/avatars/${data.avatar}" alt="avatar" style="width: 80px; height: 80px; border-radius: 50px;">
                                    <br>
                                    <label>Choose Article Title:</label>
                                    <input id="title_input" style="width: 90%;" type="text" class='form-control form-control-sm' name="title" value="${data.title}">
                                    <br>
                                    <label>Choose Article Text:</label>
                                    <textarea id="text_input" style="vertical-align: top;"  cols="50" rows="10" name="text">${data.text}</textarea>
                                    <br>
                                    <button id="send_edit">Submit</button>
                                    <button id="no">close</button>`).promise().done(function() {
                                tinymce.init({
                                    selector: "textarea",
                                    width: '100%',
                                    height: 500,
                                    plugins: ["advlist autolink lists link image charmap print preview anchor",
                                        "searchreplace visualblocks code fullscreen",
                                        "insertdatetime media table paste"
                                    ],
                                    toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image",
                                    setup: function(editor) {
                                        editor.on('change', function() {
                                            tinymce.triggerSave();
                                        });
                                    }
                                });
                            }), $("#triger").click();
                            //POST EDIT ARTICLE DATA TO SERVER
                            $('body').on('click', '#send_edit', function() {
                                    $.ajax({
                                        url: `/api/articles/article/${article_id}`,
                                        type: 'POST',
                                        data: {
                                            title: $('#title_input').val(),
                                            text: $('textarea#text_input').val(),
                                            lastUpdate: Date.now
                                        },
                                        success: function(data) {
                                            $('.modal-body').html(''), $('.modal-body').html(data)
                                            setTimeout(function() {
                                                window.location.href = '/api/register'
                                            }, 2000);
                                        },
                                        error: function(err) {
                                            $('.modal-body').html(''), $('.modal-body').html(err.responseText)
                                            setTimeout(function() {
                                                $("#triger").click();
                                            }, 2000);
                                        }
                                    });
                                })
                                //change/delete avatar
                            $('body').on('click', '#article_avatar', function() {
                                $('.modal-body').html(''), $('.modal-body').html(`
                                    <form name='articleAvatarForm'  action="/api/articles/newAvatar" method="post" enctype="multipart/form-data">
                                    <label>Choose Article Avatar:</label>
                                    <input style="width: 90%;" type="file" class='form-control form-control-sm' name="avatar">
                                    <button style="width: 95%;"  type="submit">Submit</button>
                                    </form>
                                    <div style='display:flex;flex-direction:column'>
                                    <button id="deleteAvatar">Delete Avatar</button>
                                    <button id="no">close</button>
                                    </div>
                                    `)
                                $('body').on('click', '#deleteAvatar', function() {
                                    $.ajax({
                                        url: `/api/articles/deleteAvatar/${article_id}`,
                                        type: 'DELETE',
                                        success: function(data) {
                                            $('.modal-body').html(''), $('.modal-body').html(data)
                                            setTimeout(function() {
                                                window.location.href = '/api/register'
                                            }, 2000);
                                        },
                                        error: function(err) {
                                            $('.modal-body').html(''), $('.modal-body').html(err.responseText)
                                            setTimeout(function() {
                                                $("#triger").click();
                                            }, 2000);
                                        }
                                    });
                                })
                                $("form[name='articleAvatarForm']").on("submit", function(ev) {
                                    ev.preventDefault(); // Prevent browser default submit.
                                    var formData = new FormData(this);

                                    $.ajax({
                                        url: `/api/articles/addAvatar/${article_id}`,
                                        type: "POST",
                                        data: formData,
                                        success: function(msg) {
                                            $('.modal-body').html(''), $('.modal-body').html(msg)
                                            setTimeout(function() {
                                                window.location.href = '/api/dashboard'
                                            }, 2000);
                                        },
                                        error: function(err) {
                                            $('.modal-body').html(''), $('.modal-body').html(err.responseText)
                                            setTimeout(function() {
                                                $("#triger").click();
                                            }, 2000);
                                        },
                                        cache: false,
                                        contentType: false,
                                        processData: false
                                    });

                                });
                            })
                        },
                        error: function(err) {
                            $('.modal-body').html(''), $('.modal-body').html(err.responseText)
                            setTimeout(function() {
                                $("#triger").click();
                            }, 2000);
                        }
                    });
                });
            },
            error: function(err) {
                $('.modal-body').html(''), $('.modal-body').html(err.responseText)
                setTimeout(function() {
                    $("#triger").click();
                }, 2000);
            }
        });

    }


    //SEND NEW ARTICLE DATA TO SERVER
    $("form[name='avatarForm']").on("submit", function(ev) {
        ev.preventDefault(); // Prevent browser default submit.

        var formData = new FormData(this);


        $.ajax({
            url: "/api/articles/newArticle",
            type: "POST",
            data: formData,
            success: function(msg) {
                $('.modal-body').html(''), $('.modal-body').html(msg), $("#triger").click();
                setTimeout(function() {
                    window.location.href = '/api/dashboard'
                }, 2000);
            },
            error: function(err) {
                $('.modal-body').html(''), $('.modal-body').html(err.responseText), $("#triger").click();

            },
            cache: false,
            contentType: false,
            processData: false
        });

    });
});








//*****SIDE NAV FUNCTIONS *****/
/* Set the width of the side navigation to 250px and the left margin of the page content to 250px and add a black background color to body */
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
    document.getElementById("nav").style.marginLeft = "250px";
}

/* Set the width of the side navigation to 0 and the left margin of the page content to 0, and the background color of body to white */
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
    document.getElementById("nav").style.marginLeft = "0";
}