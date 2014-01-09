var expect = require ( 'chai' ).expect
  , request = require ( 'supertest' )
  , app = require ( '../../../index' )
  , testEnv = require ( './util' ).testEnv;


describe ( '/roles', function () {
    var authUser
      , cookie
      , authUsername = "dimitrios@clevertech.biz"
      , authPass = '1q2w3e';

    before ( function ( done ) {
        this.timeout ( 9000 );
        testEnv ().then ( function () {
            //Get Auth User
            request ( app )
                .post ( '/user/login' )
                .send ( { username: authUsername, password: authPass } )
                .end ( function ( err, res ) {
                    expect (err ).to.not.exist;
                    expect ( res ).to.have.property ( 'status' ).and.equal ( 200 );
                    cookie = res.headers['set-cookie'];
                    authUser = res.body;
                    done ();
                } );
        } )
            .fail ( done );
    } );

    // /*** GET REQUEST ***/
    describe ( 'GET /roles', function () {

        it ( 'should return status 200', function ( done ) {

            request ( app )
                .get ( '/roles' )
                .set ( 'cookie', cookie )
                .end ( function ( err, res ) {

                    expect ( err ).to.not.exist;
                    expect ( res ).to.have.property ( 'status' ).and.equal ( 200 );
                    expect ( res ).to.have.property ( 'header' );
                    expect ( res.header ).to.have.property ( 'content-type', 'application/json' );

                    done ();
                } );
        } );

        it ( 'should return array of roles for auth user account, and for each role must map into a permission array', function ( done ) {

            request ( app )
                .get ( '/roles' )
                .set ( 'cookie', cookie )
                .end ( function ( err, res ) {
                    expect ( err ).to.not.exist;

                    expect ( res.body.length ).to.exist;
                    expect ( res.body[0].permissions.length ).to.exist;

                    done ();
                } );
        } );

        it ( 'Unauthorized request must return status 401', function ( done ) {

            request ( app )
                .get ( '/roles' )
                .end ( function ( err, res ) {

                    expect ( err ).to.not.exist;

                    expect ( res ).to.have.property ( 'status' ).and.equal ( 401 );

                    done ();
                } );
        } );

    } );

    // /*** POST REQUEST ***/
    describe ( 'POST /roles', function () {

        it ( 'Unauthorized request must return status 403', function ( done ) {
            request ( app )
                .post ( '/roles' )
                .end ( function ( err, res ) {

                    expect ( err ).to.not.exist;

                    expect ( res ).to.have.property ( 'status' ).and.equal ( 403 );

                    done ();
                } );
        } );

        it ( 'should return status 200 and role without permissions', function ( done ) {
            request ( app )
                .post ( '/roles' )
                .set ( 'cookie', cookie )
                .send ( {
                    name: "newrole",
                    description: "new role description"
                } )
                .end ( function ( err, res ) {
                    expect ( err ).to.not.exist;

                    expect ( res ).to.have.property ( 'status' ).and.equal ( 200 );
                    expect ( res ).to.have.property ( 'header' );
                    expect ( res.header ).to.have.property ( 'content-type', 'application/json' );

                    expect ( res.body ).to.have.property ( 'id' );
                    expect ( res.body ).to.have.property ( 'name' ).and.equal ( "newrole" );

                    expect ( res.body.permissions.length ).to.exist;
                    expect ( res.body.permissions ).to.have.length ( 0 );

                    done ();
                } );

        } );

        it ( 'should return status 200 and role with permissions', function ( done ) {

            request ( app )
                .post ( '/roles' )
                .set ( 'cookie', cookie )
                .send ( {
                    name: "newrole2",
                    description: "new role description 2",
                    permissions: [1, 2, 3]
                } )
                .end ( function ( err, res ) {
                    expect ( err ).to.not.exist;

                    expect ( res ).to.have.property ( 'status' ).and.equal ( 200 );
                    expect ( res ).to.have.property ( 'header' );
                    expect ( res.header ).to.have.property ( 'content-type', 'application/json' );

                    expect ( res.body ).to.have.property ( 'id' );
                    expect ( res.body ).to.have.property ( 'name' ).and.equal ( "newrole2" );


                    expect ( res.body ).to.have.property ( 'permissions' ).with.lengthOf ( 3 );

                    done ();
                } );

        } );

    } );

    describe ( 'POST /roles/:id', function () {

        it ( 'should return status 403 for not logged in users', function ( done ) {
            request ( app )
                .post ( '/roles/:id' )
                .end ( function ( err, res ) {

                    expect ( err ).to.not.exist;

                    expect ( res ).to.have.property ( 'status' ).and.equal ( 403 );

                    done ();
                } );
        } );

        it ( 'should return status 403 and message if role id on param and body does not much', function ( done ) {

            request ( app )
                .post ( '/roles/' + 1 )
                .set ( 'cookie', cookie )
                .send ( {
                    name: "owner2",
                    id: 3
                } )
                .end ( function ( err, res ) {
                    expect ( err ).to.not.exist;

                    expect ( res ).to.have.property ( 'status' ).and.equal ( 403 );
                    expect ( res.body ).to.be.a ( 'string' ).and.not.be.empty;
                    done ();
                } );
        } );

        it ( 'should return status 400 and message if permissions are missing', function ( done ) {

            request ( app )
                .post ( '/roles/' + 1 )
                .set ( 'cookie', cookie )
                .send ( {
                    name: "owner2",
                    id: 1
                } )
                .end ( function ( err, res ) {

                    expect ( err ).to.not.exist;

                    expect ( res ).to.have.property ( 'status' ).and.equal ( 400 );
                    expect ( res.body ).to.be.a ( 'string' ).and.not.be.empty;

                    done ();
                } );
        } );

        it ( 'should return status 200 and update role along with permissions', function ( done ) {

            request ( app )
                .post ( '/roles' )
                .set ( 'cookie', cookie )
                .send ( {
                    name: "newrole2",
                    description: "new role description 2",
                    permissions: [1, 2, 3]
                } )
                .end ( function ( err, res ) {
                    expect ( err ).to.not.exist;

                    expect ( res ).to.have.property ( 'status' ).and.equal ( 200 );
                    expect ( res ).to.have.property ( 'header' );
                    expect ( res.header ).to.have.property ( 'content-type', 'application/json' );
                    expect ( res.body ).to.have.property ( 'id' );
                    expect ( res.body ).to.have.property ( 'name' ).and.equal ( "newrole2" );
                    expect ( res.body ).to.have.property ( 'permissions' ).with.lengthOf ( 3 );

                    request ( app )
                        .post ( '/roles/' + res.body.id )
                        .set ( 'cookie', cookie )
                        .send ( {
                            name: "updatedRole",
                            id: res.body.id,
                            permissions: [1, 3]
                        } )
                        .end ( function ( err, res ) {
                            expect ( err ).to.not.exist;

                            expect ( res ).to.have.property ( 'status' ).and.equal ( 200 );
                            expect ( res ).to.have.property ( 'header' );
                            expect ( res.header ).to.have.property ( 'content-type', 'application/json' );

                            expect ( res.body ).to.have.property ( 'id' );
                            expect ( res.body ).to.have.property ( 'name' ).and.equal ( "updatedRole" );

                            expect ( res.body ).to.have.property ( 'permissions' ).with.lengthOf ( 2 );
                            expect ( res.body.permissions ).to.include ( 1 );
                            expect ( res.body.permissions ).to.include ( 3 );
                            expect ( res.body.permissions ).to.not.include ( 2 );

                            done ();
                        } );
                } );
        } );
    } );
} );




