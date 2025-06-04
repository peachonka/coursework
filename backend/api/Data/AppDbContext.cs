using BudgetApi.Models;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace BudgetApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Expense> Expenses { get; set; }
        public DbSet<Income> Incomes { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Family> Families { get; set; }
        public DbSet<FamilyMember> FamilyMembers { get; set; }
        public DbSet<Account> Accounts { get; set; }
        public DbSet<JoinFamilyRequest> JoinFamilyRequests { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<Family>()
                .HasOne(f => f.User)
                .WithMany()
                .HasForeignKey(f => f.CreatorId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Family>()
                .HasMany(f => f.FamilyMembers)
                .WithOne(fm => fm.Family)
                .HasForeignKey(fm => fm.FamilyId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<User>()
                .HasOne(u => u.FamilyMember)
                .WithOne(fm => fm.User)
                .HasForeignKey<FamilyMember>(fm => fm.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Expense>()
                .HasOne(e => e.FamilyMember)
                .WithMany()
                .HasForeignKey(e => e.FamilyMemberId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Income>()
                .HasOne(i => i.FamilyMember)
                .WithMany()
                .HasForeignKey(i => i.FamilyMemberId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<JoinFamilyRequest>()
                .HasOne(j => j.User)
                .WithMany()
                .HasForeignKey(j => j.UserId)
                .OnDelete(DeleteBehavior.Restrict);
                
            modelBuilder.Entity<JoinFamilyRequest>()
                .HasOne(j => j.Family)
                .WithMany()
                .HasForeignKey(j => j.FamilyId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}