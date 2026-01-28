package com.gamefy.gamefy_back.model;

import com.gamefy.gamefy_back.model.enums.Roles;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "user")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Roles role;

    @Column(name = "profile_photo")
    private String profilePhoto;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pack_coaching_id", unique = true)
    private PackCoaching packCoaching;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pack_player_id", unique = true)
    private PackGamefy packGamefy;

    @Column(name = "reser_pwd_token")
    private String resetPwdToken;

    @Column(name = "2fa_token")
    private String twoFaToken;

    @OneToOne(mappedBy = "coach", cascade = CascadeType.ALL, orphanRemoval = true)
    private CoachProfile coachProfile;

    @OneToOne(mappedBy = "player", cascade = CascadeType.ALL, orphanRemoval = true)
    private Subscription subscription;

    @OneToMany(mappedBy = "coach")
    private List<CoachingSession> coachingSessions = new ArrayList<>();

    @OneToMany(mappedBy = "coach")
    private List<Reservation> coachedReservations = new ArrayList<>();

    @OneToMany(mappedBy = "player")
    private List<Reservation> playerReservations = new ArrayList<>();

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", email='" + email + '\'' +
                ", role=" + role +
                ", profilePhoto='" + profilePhoto + '\'' +
                ", packCoaching=" + (packCoaching != null ? packCoaching.getId() : null) +
                ", packGamefy=" + (packGamefy != null ? packGamefy.getId() : null) +
                ", resetPwdToken='" + resetPwdToken + '\'' +
                ", twoFaToken='" + twoFaToken + '\'' +
                '}';
    }
}