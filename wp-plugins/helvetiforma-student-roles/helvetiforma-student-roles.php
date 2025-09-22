<?php
/*
Plugin Name: HelvetiForma Student Roles
Description: Allow REST updates of user roles and auto-assign Tutor student roles on new users.
Version: 1.0.0
*/

// 1) Expose and allow updating roles via REST for admins (App Password)
add_action("rest_api_init", function () {
    register_rest_field("user", "roles", [
        "get_callback" => function ($obj) {
            $u = get_user_by("id", $obj["id"]);
            return $u ? $u->roles : [];
        },
        "update_callback" => function ($roles, $user) {
            if (!current_user_can("manage_options")) {
                return new WP_Error("rest_forbidden", __("Not allowed"), ["status" => 403]);
            }
            if (!is_array($roles)) { $roles = []; }
            $u = get_user_by("id", $user->ID);
            if (!$u) { return new WP_Error("rest_user", __("User not found"), ["status" => 404]); }
            foreach ($u->roles as $r) { $u->remove_role($r); }
            foreach ($roles as $r) { $u->add_role($r); }
            return true;
        },
        "schema" => [
            "type" => "array",
            "items" => ["type" => "string"],
            "context" => ["view", "edit"]
        ]
    ]);
});

// 2) Ensure every new user gets student-compatible roles
add_action("user_register", function ($user_id) {
    $u = get_user_by("id", $user_id);
    if (!$u) { return; }
    if (!in_array("subscriber", $u->roles, true)) {
        $u->add_role("subscriber");
    }
    if (!in_array("tutor_student", $u->roles, true)) {
        $u->add_role("tutor_student");
    }
}, 10, 1);
?>
