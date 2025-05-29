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

        // Data/AppDbContext.cs
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Уникальный индекс Email для User
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // Настройка связи Family -> User (Creator)
            modelBuilder.Entity<Family>()
                .HasOne(f => f.User)
                .WithMany()
                .HasForeignKey(f => f.CreatorId)
                .OnDelete(DeleteBehavior.Restrict); // Измените на Cascade если нужно каскадное удаление

            // Настройка связи Family -> FamilyMembers
            modelBuilder.Entity<Family>()
                .HasMany(f => f.FamilyMembers)
                .WithOne(fm => fm.Family)
                .HasForeignKey(fm => fm.FamilyId)
                .OnDelete(DeleteBehavior.Cascade);

            // Настройка связи FamilyMember -> User
            modelBuilder.Entity<User>()
                .HasOne(u => u.FamilyMember)
                .WithOne(fm => fm.User)
                .HasForeignKey<FamilyMember>(fm => fm.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Настройка для Expenses
            modelBuilder.Entity<Expense>()
                .HasOne(e => e.FamilyMember)
                .WithMany()
                .HasForeignKey(e => e.FamilyMemberId)
                .OnDelete(DeleteBehavior.Restrict);

            // Настройка для Incomes
            modelBuilder.Entity<Income>()
                .HasOne(i => i.FamilyMember)
                .WithMany()
                .HasForeignKey(i => i.FamilyMemberId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}